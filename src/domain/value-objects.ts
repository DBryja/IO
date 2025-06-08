// Domain Value Objects
export class EventId {
  constructor(public readonly value: string) {}

  static generate(): EventId {
    return new EventId(crypto.randomUUID());
  }

  equals(other: EventId): boolean {
    return this.value === other.value;
  }
}

export class OrganizerId {
  constructor(public readonly value: string) {}

  static generate(): OrganizerId {
    return new OrganizerId(crypto.randomUUID());
  }

  equals(other: OrganizerId): boolean {
    return this.value === other.value;
  }
}

export enum EventType {
  PUBLIC = 'public',
  PRIVATE = 'private'
}

export enum TicketType {
  FREE = 'free',
  PAID = 'paid'
}

export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'PLN'
  ) {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}

export class Location {
  constructor(
    public readonly address?: string,
    public readonly isOnline: boolean = false
  ) {
    if (!address && !isOnline) {
      throw new Error('Event must have either address or be online');
    }
  }
}
