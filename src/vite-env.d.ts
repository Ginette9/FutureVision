/// <reference types="vite/client" />

declare module '*.db' {
  const url: string;
  export default url;
}

declare module '*.db?url' {
  const url: string;
  export default url;
}