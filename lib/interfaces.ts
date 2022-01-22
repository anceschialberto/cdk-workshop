export enum Environment {
  Dev,
  Prod
}

export interface Config {
  targetEnv: Environment;
}