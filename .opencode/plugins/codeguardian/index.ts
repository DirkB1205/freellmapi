import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: 'codeguardian',
  async setup(ctx) {
    ctx.hooks.register('tool_pre_use', (toolCall) => {
      const tool = toolCall.tool
      if (!['edit', 'write', 'shell'].includes(tool)) return toolCall

      // Secret-Erkennung
      const dangerousPatterns = [
        /sk-[a-zA-Z0-9]{20,}/,
        /password\s*=\s*['"][^'"]+['"]/i
      ]
      const content = toolCall.args?.content ?? toolCall.args?.command ?? ''

      for (const pattern of dangerousPatterns) {
        if (pattern.test(content)) {
          throw new Error('CodeGuardian Block: Mögliches Klartext-Secret entdeckt.')
        }
      }

      // Destruktive Shell-Befehle blockieren
      if (tool === 'shell') {
        const cmd = toolCall.args?.command ?? ''
        if (/git\s+push\s+.*--force/.test(cmd)) {
          throw new Error('CodeGuardian Block: Destruktiver Befehl "git push --force" abgefangen.')
        }
        if (/rm\s+-rf\s+[\\/]/.test(cmd)) {
          throw new Error('CodeGuardian Block: Destruktiver Befehl "rm -rf" abgefangen.')
        }
      }

      return toolCall
    })
  }
})