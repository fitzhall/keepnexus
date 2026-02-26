import { IS_DESKTOP } from '@/lib/platform'

/**
 * Native file save dialog for desktop builds.
 * Falls back to browser blob download on web.
 */
export async function saveFileNative(content: string, defaultName: string): Promise<boolean> {
  if (!IS_DESKTOP) return false

  try {
    const { save } = await import('@tauri-apps/plugin-dialog')
    const { writeTextFile } = await import('@tauri-apps/plugin-fs')

    const filePath = await save({
      defaultPath: defaultName,
      filters: [
        { name: 'KEEP File', extensions: ['keep'] },
        { name: 'JSON', extensions: ['json'] },
      ],
    })

    if (!filePath) return false

    await writeTextFile(filePath, content)
    return true
  } catch (err) {
    console.error('Native save failed:', err)
    return false
  }
}

/**
 * Native file open dialog for desktop builds.
 * Returns file content as string, or null if cancelled.
 */
export async function openFileNative(): Promise<string | null> {
  if (!IS_DESKTOP) return null

  try {
    const { open } = await import('@tauri-apps/plugin-dialog')
    const { readTextFile } = await import('@tauri-apps/plugin-fs')

    const filePath = await open({
      multiple: false,
      filters: [
        { name: 'KEEP File', extensions: ['keep', 'keepnexus', 'shard', 'json'] },
      ],
    })

    if (!filePath) return null

    // open() returns string | string[] depending on multiple flag
    const path = Array.isArray(filePath) ? filePath[0] : filePath
    if (!path) return null

    return await readTextFile(path)
  } catch (err) {
    console.error('Native open failed:', err)
    return null
  }
}
