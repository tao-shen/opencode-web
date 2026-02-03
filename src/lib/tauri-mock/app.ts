// Mock for @tauri-apps/api/app
export const getName = async () => 'OpenChamber Web'

export const getVersion = async () => '1.0.0'

export const getTauriVersion = async () => '2.0.0'

export const hide = async () => {}

export const show = async () => {}

export const exit = async () => {
  // In web environment, we can't exit the app
  console.log('Exit called in web environment')
}

export const restart = async () => {
  console.log('Restart called in web environment')
}

export const requestShow = async () => {}