const express = require("express");
const morgan = require("morgan")
const cors = require("cors")
const app = express();

app.use(cors());
app.use(express.json());
// app.use(morgan("tiny"));
//exercise 3.8
morgan.token("body" , (req) => JSON.stringify(req.body));

const morganFormat = ':method :url :status :res[content-length] - :response-time ms :body';

app.use(morgan(morganFormat));

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];
// exercise 3.1
app.get("/api/persons", (request, response) => {
  response.json(persons);
});
// exercise 3.2
app.get("/info", (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>`);
});

// exercise 3.3
app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((p) => p.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

//exercise 3.4 delete
app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((p) => p.id !== id);
  response.status(204).end();
});

// exercise 3.5
const generatedId = () => {
  const maxId =
    persons.length > 0 ? Math.max(...persons.map((p) => Number(p.id))) : 0;

  return String(maxId + 1);
};

app.post("/api/persons", (request, response) => {
  const body = request.body;
  // exercise 3.6
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "name or number missing",
    });
  } else if (persons.find((p) => p.name === body.name)) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  const person = {
    id: generatedId(),
    name: body.name,
    number: body.number,
  };
  persons = persons.concat(person);
  response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
