import { registerCommand } from '../terminal/CommandRegistry'
import { detectSubscriptions, calculateMonthlyTotal, calculateAnnualProjection } from '../../services/subscriptions'

registerCommand({
  name: 'subscr',
  description: 'Subscription tracking — list, scan, detail',
  usage: 'subscr <list|scan|detail> [name]',
  handler: async (args: string[]) => {
    const subcommand = args[0]?.toLowerCase()

    if (!subcommand || subcommand === 'help') {
      return [
        'SUBSCRIPTION COMMANDS:',
        '  subscr list                             List all subscriptions',
        '  subscr scan                             Scan Gmail for subscriptions',
        '  subscr detail <name>                    Show subscription details',
      ].join('\n')
    }

    if (subcommand === 'list' || subcommand === 'scan') {
      const result = await detectSubscriptions()
      if (!result.data) return `ERROR: ${result.error}`
      if (result.data.length === 0) return 'NO SUBSCRIPTIONS DETECTED'

      const total = calculateMonthlyTotal(result.data)
      const annual = calculateAnnualProjection(total)
      const forgotten = result.data.filter((s) => s.usageStatus === 'forgotten').length

      const lines = [
        `SUBSCRIPTIONS: ${result.data.length} SERVICES`,
        `MONTHLY TOTAL: $${total.toFixed(2)}`,
        `ANNUAL PROJECTION: $${annual.toFixed(2)}`,
        `FORGOTTEN: ${forgotten}`,
        '',
        ...result.data.map(
          (s) =>
            `  ${s.serviceName.padEnd(20)} $${s.monthlyCost.toFixed(2).padStart(7)}/MO  ${s.category.toUpperCase().padEnd(12)} ${s.usageStatus === 'forgotten' ? '[FORGOTTEN]' : ''}`,
        ),
      ]
      return lines.join('\n')
    }

    if (subcommand === 'detail') {
      const name = args.slice(1).join(' ')
      if (!name) return 'USAGE: subscr detail <service-name>'

      const result = await detectSubscriptions()
      if (!result.data) return `ERROR: ${result.error}`

      const sub = result.data.find(
        (s) => s.serviceName.toLowerCase() === name.toLowerCase(),
      )
      if (!sub) return `SUBSCRIPTION "${name}" NOT FOUND`

      return [
        `SERVICE: ${sub.serviceName.toUpperCase()}`,
        `MONTHLY COST: $${sub.monthlyCost.toFixed(2)}`,
        `CATEGORY: ${sub.category.toUpperCase()}`,
        `FIRST DETECTED: ${sub.detectedSince}`,
        `LAST CHARGE: ${sub.lastCharge}`,
        `STATUS: ${sub.usageStatus.toUpperCase()}`,
      ].join('\n')
    }

    return `UNKNOWN SUBCOMMAND: ${subcommand}. TYPE "SUBSCR HELP" FOR USAGE.`
  },
})
