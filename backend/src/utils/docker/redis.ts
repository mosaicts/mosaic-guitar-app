import Docker from 'dockerode';

import { containerExec, imageExists, pullImageAsync } from 'dockerode-utils';

export { containerExec } from 'dockerode-utils';

const CONTAINER_IMAGE = 'redis:8-alpine';
const CONTAINER_NAME = 'redis-test';

export const removeRedisContainer = async (): Promise<void> => {
  const docker = new Docker();
  try {
    const container = docker.getContainer(CONTAINER_NAME);
    try {
      await container.stop();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // 304 = container already stopped
      if (error.statusCode !== 304) throw error;
    }
    await container.remove({ v: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // 404 = container not found
    if (error.statusCode !== 404) throw error;
  }
};

const ensureRedisServiceReadiness = async (container: Docker.Container) => {
  await containerExec(container, [
    'bash',
    '-c',
    `until redis-cli PING > /dev/null 2>&1 ; do echo "waiting redis service to be ready"; sleep 1; done`
  ]);
};

export const setupRedisContainer = async (port: string) => {
  const docker = new Docker();
  const needsToPull = !(await imageExists(docker, CONTAINER_IMAGE));

  if (needsToPull) await pullImageAsync(docker, CONTAINER_IMAGE);

  await removeRedisContainer();

  const container = await docker.createContainer({
    Env: ['NODE_ENV=test'],
    HostConfig: {
      PortBindings: {
        '6379/tcp': [
          {
            HostPort: port
          }
        ]
      }
    },
    ExposedPorts: { '6379/tcp': {} },
    Image: CONTAINER_IMAGE,
    name: CONTAINER_NAME
  });
  await container.start();

  await ensureRedisServiceReadiness(container);
  return container;
};
