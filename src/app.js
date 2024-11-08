const express = require("express");
const healthRoute = require("./routes/health");

const app = express();
const port = process.env.PORT || 3000;

app.use("/api/v1", healthRoute);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
