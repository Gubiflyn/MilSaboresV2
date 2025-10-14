export const saveLocalstorage = (key,data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data))
    } catch (ex) {
        console.error("Error al guardar: ",ex)
    }
}

export const loadFromLocalstorage = (key) => {
    try {
        const data = localStorage.getItem(key)
        return data ? JSON.parse(data) : null
    } catch (ex) {
        console.error("Error al guardar: ",ex)
    }
}

export const deleteFromLocalstorage = (key) => {
    try {
        localStorage.removeItem(key)
    } catch (ex) {
        console.error("Error al guardar: ",ex)
    }
}

//métodos para el carrito (guiño guiño)


//métodos para el login


//métodos para los pokemones