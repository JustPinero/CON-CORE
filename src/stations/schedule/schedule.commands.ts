import { registerCommand } from '../terminal/CommandRegistry'
import { getTemplates } from '../../services/schedule'
import { batchCreateEvents, checkConflicts } from '../../services/calendar'
import { getDatesInRange, filterDatesByDayType, formatDateISO } from '../../utils/date-range'
import type { ScheduleTemplate, TimeBlock } from '../../utils/types'

function generateEventsFromTemplate(template: ScheduleTemplate, startDate: string, endDate: string) {
  const allDates = getDatesInRange(startDate, endDate)
  const matchingDates = filterDatesByDayType(allDates, template.dayType)

  return matchingDates.flatMap((date) => {
    const dateStr = formatDateISO(date)
    return template.timeBlocks.map((block: TimeBlock) => ({
      summary: block.label || template.name,
      start: `${dateStr}T${block.startTime}:00`,
      end: `${dateStr}T${block.endTime}:00`,
      calendarId: block.calendarId || 'primary',
    }))
  })
}

registerCommand({
  name: 'schedule',
  description: 'Calendar operations — templates, deploy, conflicts',
  usage: 'schedule <list-templates|deploy|conflicts> [args]',
  handler: async (args: string[]) => {
    const subcommand = args[0]?.toLowerCase()

    if (!subcommand || subcommand === 'help') {
      return [
        'SCHEDULE COMMANDS:',
        '  schedule list-templates                 List all templates',
        '  schedule deploy <name> <start> <end>    Deploy template to date range',
        '  schedule conflicts <start> <end>        Check for conflicts in date range',
      ].join('\n')
    }

    if (subcommand === 'list-templates') {
      const result = await getTemplates()
      if (!result.data || result.data.length === 0) return 'NO TEMPLATES FOUND'
      return result.data
        .map((t) => `  ${t.name.padEnd(20)} ${t.dayType.padEnd(10)} ${t.timeBlocks.length} BLOCKS`)
        .join('\n')
    }

    if (subcommand === 'deploy') {
      const templateName = args[1]
      const startDate = args[2]
      const endDate = args[3]
      if (!templateName || !startDate || !endDate) {
        return 'USAGE: schedule deploy <template-name> <start-date> <end-date>'
      }

      const templates = await getTemplates()
      const template = templates.data?.find(
        (t) => t.name.toLowerCase() === templateName.toLowerCase(),
      )
      if (!template) return `TEMPLATE "${templateName}" NOT FOUND`

      const events = generateEventsFromTemplate(template, startDate, endDate)
      if (events.length === 0) return 'NO MATCHING DATES IN RANGE'

      const result = await batchCreateEvents(events)
      if (!result.data) return `ERROR: ${result.error}`
      return `${result.data.created} EVENTS CREATED (${result.data.failed} FAILED)`
    }

    if (subcommand === 'conflicts') {
      const startDate = args[1]
      const endDate = args[2]
      if (!startDate || !endDate) {
        return 'USAGE: schedule conflicts <start-date> <end-date>'
      }

      const result = await checkConflicts(
        [{ summary: 'CHECK', start: `${startDate}T00:00:00`, end: `${endDate}T23:59:59` }],
      )
      if (!result.data) return `ERROR: ${result.error}`
      if (!result.data.hasConflicts) return 'NO CONFLICTS FOUND'
      return result.data.conflicts
        .map((c) => `  ${c.proposed.summary} CONFLICTS WITH ${c.existing.summary}`)
        .join('\n')
    }

    return `UNKNOWN SUBCOMMAND: ${subcommand}. TYPE "SCHEDULE HELP" FOR USAGE.`
  },
})
