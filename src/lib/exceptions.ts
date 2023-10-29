export class UsageExceededError extends Error {
  constructor(message = "You have exceeded the usage limit") {
    super(message);
  }
}
