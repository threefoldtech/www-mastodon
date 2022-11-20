enum SessionKeys {
  Credentials = "MASTODON_LOGIN_CREDENTIALS",
}

export abstract class Session {
  public static write(key: SessionKeys, value: any): void {
    return window.sessionStorage.setItem(key, JSON.stringify(value));
  }

  public static read<T = any>(key: SessionKeys): T {
    const value = window.sessionStorage.getItem(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  public static readonly Keys = SessionKeys;
}
