const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

let serviceAccount = require("./fir-74e66-firebase-adminsdk-fbsvc-18cf1c432b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://console.firebase.google.com/project/fir-74e66/firestore/databases/-default-/data",
});

const db = admin.firestore();
const app = express();

app.use(bodyParser.json());

const collection = "customers";

app.post("/create", async (req, res) => {
  try {
    const data = req.body;
    const docRef = db.collection(collection).doc().set(data);

    res
      .status(201)
      .send({ message: "Document created successfully", id: docRef.id });
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).send("Error creating document");
  }
});

app.get("/find-all", async (req, res) => {
  try {
    const snapshot = await db.collection(collection).get();
    if (snapshot.empty) {
      return res.status(404).send("No documents found");
    }
    const data = [];
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).send({ message: "Documents", data });
  } catch (error) {
    console.error("Error reading document:", error);
    res.status(500).send("Error reading document");
  }
});

app.get("/find/:id", async (req, res) => {
  const docId = req.params.id;

  try {
    const docRef = db.collection(collection).doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).send({ message: "not found..", data: null });
    }

    return res
      .status(200)
      .send({ message: "Document found", data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error("Error reading document:", error);
    res.status(500).send("Error reading document");
  }
});

app.put("/update/:id", async (req, res) => {
  const docId = req.params.id;
  const data = req.body;

  try {
    const docRef = db.collection(collection).doc(docId);
    const doc = await docRef.update(data);

    return res.status(200).send({ message: "updated" });
  } catch (error) {
    console.error("Error reading document:", error);
    res.status(500).send("Error reading document");
  }
});

app.delete("/delete/:id", async (req, res) => {
  const docId = req.params.id;

  try {
    const docRef = db.collection(collection).doc(docId);
    await docRef.delete();

    return res.status(200).send({ message: "deleted" });
  } catch (error) {
    console.error("Error reading document:", error);
    res.status(500).send("Error reading document");
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
