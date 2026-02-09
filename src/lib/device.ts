export function getDeviceId(): string {
    const STORAGE_KEY = 'delicias_device_id';
    let deviceId = localStorage.getItem(STORAGE_KEY);

    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY, deviceId);
    }

    return deviceId;
}
