import PocketBase from 'pocketbase';

// Connect to the local PocketBase server
// In production, this URL should probably be in an environment variable
export const pb = new PocketBase('http://127.0.0.1:8090');

// Optional: Global error handler or auth change listener
pb.authStore.onChange((token, model) => {
    console.log('Auth Changed:', { token, model });
});
