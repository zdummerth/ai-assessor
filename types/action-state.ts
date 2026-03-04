export type ActionState<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};
