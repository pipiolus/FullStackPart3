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
  res.send(`<p><b>Phonebook has info for ${
    Person.length
  } people</b></p>
    <p><b>${new Date()}<b/></p>`);
});

app.get("/api/persons/:id", (req, res) => {
  Person.findById(req.params.id).then((person) => {
    res.json(person);
  });
});

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (body.name === undefined || body.number === undefined) {
    return res.status(400).json({
      error: "missing name or number",
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person.save().then((newPerson) => {
    res.json(newPerson);
  });
});

/* app.delete("/api/persons/:id", (req, res) => {
  Person.findById(req.params.id).then(person => {
    Person.filter(person => person.id)
  });


  res.status(204).end();
}); */

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server running correctly in ${PORT}, u rules`);
});
