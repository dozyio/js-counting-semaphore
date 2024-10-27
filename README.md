# JS/TS Counting Semaphore

**Counting-Semaphore** is a lightweight, robust, and TypeScript-compatible library that provides a counting semaphore implementation for managing concurrent access to shared resources in asynchronous environments. It is ideal for scenarios where you need to limit the number of simultaneous operations, such as controlling access to a pool of database connections, managing parallel API requests, or synchronizing tasks in Node.js applications.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic Example](#basic-example)
- [API Reference](#api-reference)
  - [Constructor](#constructor)
  - [Methods](#methods)
    - [`acquire(): Promise<void>`](#acquirepromisevoid)
    - [`release(): Promise<void>`](#releasepromisevoid)
  - [Properties](#properties)
    - [`permits: number`](#permits-number)
    - [`maxPermits: number`](#maxpermits-number)
- [Debugging](#debugging)
- [Error Handling](#error-handling)
- [License](#license)

## Features

- **Concurrency Control:** Limit the number of concurrent operations accessing a shared resource.
- **Asynchronous Support:** Designed for use with asynchronous functions (`async/await`).
- **Thread-Safe:** Ensures atomic operations to prevent race conditions.
- **Debugging Support:** Optional debug mode for detailed logging.
- **TypeScript Support:** Fully typed for seamless integration with TypeScript projects.
- **Lightweight:** Minimal dependencies and overhead.

## Installation

You can install `counting-semaphore` via npm:

```bash
npm install counting-semaphore
```

Or using Yarn:

```bash
yarn add counting-semaphore
```

## Usage

### Basic Example

Here's a simple example demonstrating how to use the `Counting-Semaphore` to control access to a shared resource.

```typescript
// src/example.ts

import { Semaphore } from 'counting-semaphore';

// Initialize a semaphore with 2 permits
const semaphore = new Semaphore(2, { debug: true, name: 'ResourceSemaphore' });

// Function to simulate an asynchronous task
const asyncTask = async (id: number) => {
  try {
    console.log(`Task ${id}: Requesting to acquire a permit.`);
    await semaphore.acquire();
    console.log(`Task ${id}: Permit acquired. Performing task...`);

    // Simulate task duration
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log(`Task ${id}: Task completed. Releasing permit.`);
    await semaphore.release();
  } catch (error) {
    console.error(`Task ${id}: Failed to acquire permit - ${(error as Error).message}`);
  }
};

// Start multiple asynchronous tasks
(async () => {
  asyncTask(1);
  asyncTask(2);
  asyncTask(3);
  asyncTask(4);
})();
```

### Expected Output

When you run the example, you should see output similar to the following, illustrating how the semaphore manages permits and queues tasks when no permits are available:

```
Semaphore initialized with maxPermits: 2 for "ResourceSemaphore"
Task 1: Requesting to acquire a permit.
ResourceSemaphore Semaphore: Attempting to acquire a permit. Current permits: 2
ResourceSemaphore Semaphore: Permit acquired. Remaining permits: 1
Task 1: Permit acquired. Performing task...
Task 2: Requesting to acquire a permit.
ResourceSemaphore Semaphore: Attempting to acquire a permit. Current permits: 1
ResourceSemaphore Semaphore: Permit acquired. Remaining permits: 0
Task 2: Permit acquired. Performing task...
Task 3: Requesting to acquire a permit.
ResourceSemaphore Semaphore: Attempting to acquire a permit. Current permits: 0
ResourceSemaphore Semaphore: No permits available. Queuing the request.
Task 4: Requesting to acquire a permit.
ResourceSemaphore Semaphore: Attempting to acquire a permit. Current permits: 0
ResourceSemaphore Semaphore: No permits available. Queuing the request.
Task 1: Task completed. Releasing permit.
ResourceSemaphore Semaphore: Releasing a permit.
ResourceSemaphore Semaphore: Resolving a queued acquire request.
ResourceSemaphore Semaphore: Permit acquired from queue.
Task 3: Permit acquired. Performing task...
Task 2: Task completed. Releasing permit.
ResourceSemaphore Semaphore: Releasing a permit.
ResourceSemaphore Semaphore: Resolving a queued acquire request.
ResourceSemaphore Semaphore: Permit acquired from queue.
Task 4: Permit acquired. Performing task...
Task 3: Task completed. Releasing permit.
ResourceSemaphore Semaphore: Releasing a permit.
ResourceSemaphore Semaphore: Permit released. Available permits: 1
Task 4: Task completed. Releasing permit.
ResourceSemaphore Semaphore: Releasing a permit.
ResourceSemaphore Semaphore: Permit released. Available permits: 2
```

## API Reference

### Constructor

```typescript
new Semaphore(permits: number, opts?: SemaphoreOpts)
```

- **Parameters:**
  - `permits` (`number`): The maximum number of concurrent permits. Must be a non-negative integer.
  - `opts` (`SemaphoreOpts`, optional):
    - `debug` (`boolean`): If `true`, enables debug logging. Defaults to `false`.
    - `name` (`string`): An optional name for the semaphore, used in debug logs. Defaults to an empty string.

- **Example:**

  ```typescript
  const semaphore = new Semaphore(3, { debug: true, name: 'MySemaphore' });
  ```

### Methods

#### `acquire(): Promise<void>`

Acquires a permit from the semaphore. If a permit is available, it is granted immediately. Otherwise, the request waits until a permit is released.

- **Returns:** `Promise<void>` that resolves when the permit is acquired.

- **Throws:** No direct throws, but if the semaphore is improperly used, it may indirectly throw errors from internal methods.

- **Example:**

  ```typescript
  await semaphore.acquire();
  // Critical section: perform operations that require a permit
  await semaphore.release();
  ```

#### `release(): Promise<void>`

Releases a permit back to the semaphore. If there are pending `acquire` requests, the next one is granted a permit.

- **Returns:** `Promise<void>` that resolves when the permit is released.

- **Throws:**
  - `Error` if attempting to release more permits than the semaphore was initialized with.

- **Example:**

  ```typescript
  await semaphore.release();
  ```

### Properties

#### `permits: number`

Gets the current number of available permits.

- **Type:** `number`

- **Example:**

  ```typescript
  console.log(semaphore.permits); // Outputs the current number of available permits
  ```

#### `maxPermits: number`

Gets the maximum number of permits the semaphore was initialized with.

- **Type:** `number`

- **Example:**

  ```typescript
  console.log(semaphore.maxPermits); // Outputs the maximum number of permits
  ```

## Debugging

The `Counting-Semaphore` supports an optional debug mode, which provides detailed logging of semaphore operations. To enable debugging, set the `debug` option to `true` when initializing the semaphore.

```typescript
const semaphore = new Semaphore(2, { debug: true, name: 'DebugSemaphore' });
```

**Sample Debug Output:**

```
Semaphore initialized with maxPermits: 2 for "DebugSemaphore"
DebugSemaphore Semaphore: Attempting to acquire a permit. Current permits: 2
DebugSemaphore Semaphore: Permit acquired. Remaining permits: 1
DebugSemaphore Semaphore: Releasing a permit.
DebugSemaphore Semaphore: Resolving a queued acquire request.
DebugSemaphore Semaphore: Permit acquired from queue.
```

## Error Handling

**Best Practices:**

- Always ensure that each `acquire` call is paired with a corresponding `release` to prevent deadlocks.
- Use try-catch blocks around critical sections to handle potential errors gracefully.

## License

This project is licensed under the [MIT License](LICENSE).
