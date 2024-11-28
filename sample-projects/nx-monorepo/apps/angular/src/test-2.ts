// @ts-strict-ignore
interface TestType {
  bar: string;
}

const foo1: TestType | undefined = undefined;

export const booAbc = foo1.bar;
