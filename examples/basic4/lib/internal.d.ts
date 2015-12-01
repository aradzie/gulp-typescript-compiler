declare module M1 {
    function test(id: string): void;
}
declare module M2 {
    function test(id: string): void;
}
declare module "external1" {
    export function test(id: string): void;
}
declare module "external2" {
    export function test(id: string): void;
}
declare module "basic4/src/main" {
}
