export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

export class InsufficientStockError extends DomainError {
  constructor(productName: string, available: number, requested: number) {
    super(`Insufficient stock for ${productName}: available ${available}, requested ${requested}`);
    this.name = "InsufficientStockError";
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string) {
    super(`${entity} not found`);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}
