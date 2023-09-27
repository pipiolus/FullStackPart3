require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

const app = express();

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());

morgan.token("content", (req) => JSON.stringify(req.body));
app.use(
  morgan(
    ":method :url :status :res[content-length] :response-time ms :content"
  )
);

app.get("/", (req, res) => {
  res.send("<h1>Hello Brouu</h1>");
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get("/info", (req, res) => {
  Person.find({}).then((persons) => {
    const length = Object.keys(persons).length;
    res.send(`
    <h2>Phonebook has info for ${length} people</h2>
    <p>${new Date()}</p>
    `);
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      res.json(person);
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (req, res, next) => {
  const body = req.body;

  if (body.name === undefined || body.number === undefined) {
    return res
      .status(400)
      .json({
        error: "missing name or number",
      })
      .catch((error) => next(error));
  }
  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person.save().then((newPerson) => {
    res.json(newPerson);
  });
});

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number,
  };
  Person.findByIdAndUpdate(req.params.id, person, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "Unknown Endpoint" });
};
app.use(unknownEndpoint);

const handleError = (error, req, res, next) => {
  console.log(error.message);

  if (error.name === "CastError") {
    return res.status(400).json({ error: "Bad Request" });
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: "Validation Error" });
  }
  next(error);
};

app.use(handleError);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server running correctly in ${PORT}, u rules`);
});
