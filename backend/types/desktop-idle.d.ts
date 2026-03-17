declare module "desktop-idle" {
  const idle: {
    getIdleTime: () => number;
  };
  export default idle;
}