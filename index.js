const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

let persons = [
    {
        name: "Mary Poppendieck",
        number: "39-23-6423122",
        id: 1
    },
    {
        name: "Henri Sahlberg",
        number: "20132131",
        id: 2
    },
    {
        name: "Arto Paasikivi",
        number: "20132131",
        id: 3
    },
    {
        name: "Arto Hellas",
        number: "1231200123",
        id: 4
    }
]

morgan.token('body', (req) =>  
    JSON.stringify(req.body)
)

const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


app.get('/', (request, response) => {
    response.redirect('/info')
})

app.get('/info', (request, response) => {
    response.send(
        `<p>Phonebook has info for ${persons.length} people.</p>
        <p>${new Date()}`
    )
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})


app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => String(person.id) === id)

    if (person) {
        response.json(person)
    }
    else {
        response.status(404).end()
    }
})

const generateId = () => {
    const genID = () => Math.floor(Math.random() * 10000)
    let id = genID()
    while (persons.find((person) => person.id === id)) {
        id = genID()
    }
    return id
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        response.status(400).json({
            error: 'content missing'
        })
    }
    else if (persons.find(person => person.name === body.name)) {
        response.status(400).json({
            error: 'name must be unique'
        })
    }
    else {
        const person = {
            name: body.name,
            number: body.number ? body.number : 'no number',
            id: generateId(),
        }

        persons = persons.concat(person)

        response.json(person)
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => String(person.id) !== id)

    response.status(204).end()
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});
