export interface IUrlDB {
  getUrl(group: string, name: string): string;
  getPassword(group: string, user: string): string;
  dump(): string;
}

export interface IGroup {
  getUrlNames(): string[];
  getUsers(): string[];

  getUrl(name: string): string;
  getPassword(user: string): string;
}