function autocomplete (input, latInput, lngInput) {

    if (!input ) {
        return
    }

    const dropdowm = new google.maps.places.Autocomplete(input)

    dropdowm.addListener('place_changed', () => {
        const place = dropdowm.getPlace()
        latInput.value = place.geometry.location.lat()
        lngInput.value = place.geometry.location.lng()
    })

    input.on('keydown', e => {
        if ( e.keycode === 13 ) e.preventDefault
    })
}

export default autocomplete