const logos: { [key: string]: string } = {};

export const grabLogo = (name: string) => logos[name];
export const setLogo = (name: string, path: string) => (logos[name] = path);
