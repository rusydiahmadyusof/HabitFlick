import * as functions from "firebase-functions";

// Export API functions
// Will be added in subsequent phases

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.json({ message: "Hello from Firebase!" });
});

