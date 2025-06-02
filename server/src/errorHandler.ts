export function errorHandler<T extends (...args: any[]) => Promise<any>>(fn: T) {
  return function (...args: any[]) {
    const next = args[args.length - 1];
    Promise.resolve(fn(...args)).catch(next);
  } as unknown as T;
} 