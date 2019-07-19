/* eslint-disable */
const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationUrlTemplate = document.querySelector('#location-url-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// Change Default Mustache Tags to avoid conflicts with handlebars
Mustache.tags = ['[[', ']]']

const autoscroll = () => {
    // Grab the new message
    $newMessage = $messages.lastElementChild

    // height of the new message
    newMessageStyles = getComputedStyle($newMessage)
    newMessageMargin = parseInt(newMessageStyles.marginBottom)
    newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled
    const scrollOffset = Math.ceil($messages.scrollTop + visibleHeight)   // the amount (as a number) we have scrolled from the top

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {

    console.log(message)    
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        // documentation for moment format https://momentjs.com/docs/#/displaying/
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (location) => {
    console.log(location)
    const html = Mustache.render(locationUrlTemplate, {
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    // so the browser doesn't reload the page when the user clicks on submit
    e.preventDefault()

    // disable submit button
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    
    if (!message.trim()) {
        $messageFormButton.removeAttribute('disabled')
        return
    }

    socket.emit('sendMessage', message, (error) => {
        // enable submit button
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }
        console.log('Message delivered')
    })
})

$locationButton.addEventListener('click', () => {

    // docs available at https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your location')
    }
    $locationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', coords, () => {
            console.log('Location Shared!')
            $locationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})