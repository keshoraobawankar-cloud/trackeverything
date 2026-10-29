import net from 'net';

/**
 * Helper function that attempts to create a server on a provided port to check
 * for availability, returning the port if free or incrementing it recursively
 * until a free port is found.
 *
 * @param port - Starting port number (defaults to 3000)
 * @param host - Host address to bind to (defaults to '0.0.0.0')
 * @returns Promise<number> - Resolves to the available port number
 */
export function findAvailablePort(port: number = 3000, host: string = '0.0.0.0'): Promise<number> {
  return new Promise((resolve) => {
    const tester = net.createServer();

    tester.once('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[server-utils] Port ${port} is in use. Incrementing recursively to check port ${port + 1}...`);
        resolve(findAvailablePort(port + 1, host));
      } else {
        console.warn(`[server-utils] Port ${port} encountered ${err.code}. Trying port ${port + 1}...`);
        resolve(findAvailablePort(port + 1, host));
      }
    });

    tester.once('listening', () => {
      tester.close(() => {
        resolve(port);
      });
    });

    tester.listen(port, host);
  });
}

/**
 * Checks if a specific port is currently available.
 *
 * @param port - Port number to test
 * @param host - Host address (defaults to '0.0.0.0')
 * @returns Promise<boolean> - True if available, false if in use
 */
export function isPortAvailable(port: number, host: string = '0.0.0.0'): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once('error', () => resolve(false));
    tester.once('listening', () => {
      tester.close(() => resolve(true));
    });
    tester.listen(port, host);
  });
}

export const getAvailablePort = findAvailablePort;
