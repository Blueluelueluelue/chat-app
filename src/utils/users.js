const users = []

const addUser = ({ id, username, room }) => {
    // Clean data
    username = username.toLowerCase().trim()
    room = room.toLowerCase().trim()

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room must be provided'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is already in use!'
        }
    }

    // Store user
    const user = {id, username, room}
    users.push(user)
    return { user }    
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const user = users.find((user) => user.id === id)
    return user
}

const getUsersInRoom = (room) => {
    room = room.toLowerCase().trim()
    const usersInRoom = users.filter((user) => user.room === room)
    return usersInRoom
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}