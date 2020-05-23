export default {} as {
  [n: number]:
    | (<
        T extends {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          [s: string]: any;
        }
      >(
        data: T
      ) => T)
    | undefined;
};
