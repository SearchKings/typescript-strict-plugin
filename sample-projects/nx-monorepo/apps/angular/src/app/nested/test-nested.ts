interface TestType {
  bar: string;
}

const foo1: TestType | undefined = undefined;

export const booNested = foo1.bar;
