require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

morgan.token('body', (req) =>
    JSON.stringify(req.body)
)

const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/info', (request, response) => {
    Person.find({}).then(persons => {
        response.send(
            `<p>Phonebook has info for ${persons.length} people.</p>
            <p>${new Date()}`
        )
    })
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons =>
        response.json(persons.map(person => person.toJSON())))
})

app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findById(id).then(person => {
        if (person) {
            response.json(person.toJSON())
        }
        else {
            response.status(404).end()
        }
    }).catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        response.status(400).json({
            error: 'content missing'
        })
    }
    // else if (persons.find(person => person.name === body.name)) {
    //     response.status(400).json({
    //         error: 'name must be unique'
    //     })
    // }
    else {
        const person = new Person({
            name: body.name,
            number: body.number
        })
        person.save().then(savedPerson =>
            response.json(savedPerson.toJSON())
        )
    }
})

app.put('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    const body = request.body
    if (!body.name || !body.number) {
        response.status(400).json({
            error: 'content missing'
        })
    }
    else {

        const person = {
            name: body.name,
            number: body.number
        }

        Person.findByIdAndUpdate(id, person, { new: true })
            .then(updatedPerson =>
                response.json(updatedPerson.toJSON())
            ).catch(error => next(error))

    }
})

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findByIdAndRemove(id).then(result =>
        response.status(204).end()
    ).catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: `malformatted id` })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${PORT}`);
});
