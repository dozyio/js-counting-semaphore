/* eslint-disable no-console */
// src/semaphore.ts

export interface SemaphoreOpts {
  debug?: boolean
  name?: string
}

export class Semaphore {
  private _permits: number
  private readonly waiting: Array<() => void> = []
  private readonly _maxPermits: number
  private readonly debug: boolean
  private readonly name: string
  private _lock: Promise<void> = Promise.resolve()

  constructor (permits: number, opts: SemaphoreOpts = {}) {
    if (permits < 0) {
      throw new Error('Semaphore must be initialized with a non-negative number of permits.')
    }
    this._permits = permits
    this._maxPermits = permits
    this.debug = opts.debug ?? false
    this.name = opts.name ?? ''

    if (this.debug) {
      console.log(`Semaphore initialized with maxPermits: ${this.maxPermits} for "${this.name}"`)
    }
  }

  /**
   * Acquires a permit from the semaphore.
   * If a permit is available, it is granted immediately.
   * Otherwise, the request waits until a permit is released.
   */
  async acquire (): Promise<void> {
    const releaseLock = await this._acquireLock()

    let shouldWait = false

    try {
      if (this.debug) {
        console.log(
          `${this.name} Semaphore: Attempting to acquire a permit. Current permits: ${this.permits}`
        )
      }

      if (this._permits > 0) {
        this._permits--
        if (this.debug) {
          console.log(
            `${this.name} Semaphore: Permit acquired. Remaining permits: ${this.permits}`
          )
        }
        return
      }

      if (this.debug) {
        console.log(`${this.name} Semaphore: No permits available. Queuing the request.`)
      }

      // No permits available; need to wait
      shouldWait = true
    } finally {
      releaseLock()
    }

    if (shouldWait) {
      // Await outside the locked critical section
      await new Promise<void>((resolve) => {
        this.waiting.push(resolve)
      })

      if (this.debug) {
        console.log(`${this.name} Semaphore: Permit acquired from queue.`)
      }
    }
  }

  /**
   * Releases a permit back to the semaphore.
   * If there are pending acquire requests, the next one is granted a permit.
   */
  async release (): Promise<void> {
    const releaseLock = await this._acquireLock()

    try {
      if (this.debug) {
        console.log(`${this.name} Semaphore: Releasing a permit.`)
      }

      if (this.waiting.length > 0) {
        // There are waiting acquires; resolve the next one
        const resolve = this.waiting.shift()
        if (resolve !== undefined) {
          if (this.debug) {
            console.log(`${this.name} Semaphore: Resolving a queued acquire request.`)
          }
          // Grant the permit to the next waiting request
          resolve()
          return
        }
      }

      // No waiting acquires; increment permits if possible
      if (this._permits < this._maxPermits) {
        this._permits++
        if (this.debug) {
          console.log(`${this.name} Semaphore: Permit released. Available permits: ${this.permits}`)
        }
      } else {
        // Attempted to release more permits than allowed
        if (this.debug) {
          console.warn(
            `${this.name} Semaphore: Attempted to release more permits than the maximum (${this.maxPermits}).`
          )
        }
      }
    } finally {
      releaseLock()
    }
  }

  /**
   * Internal method to acquire the lock before performing operations.
   * Ensures that only one operation modifies the semaphore's state at a time.
   */
  private async _acquireLock (): Promise<() => void> {
    let release: () => void = () => { } // Initialize with a no-op function

    const lock = new Promise<void>((resolve) => {
      release = resolve
    })

    const previousLock = this._lock
    this._lock = this._lock.then(async () => lock)

    await previousLock
    return release
  }

  /**
   * Returns the current number of available permits.
   */
  get permits (): number {
    return this._permits
  }

  /**
   * Returns the maximum number of permits the semaphore was initialized with.
   */
  get maxPermits (): number {
    return this._maxPermits
  }
}
