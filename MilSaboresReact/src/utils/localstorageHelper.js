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
export const saveCarrito = (carrito) => {
    try {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    } catch (ex) {
        console.error("Error al guardar carrito: ", ex);
    }
};

export const loadCarrito = () => {
    try {
        const data = localStorage.getItem('carrito');
        return data ? JSON.parse(data) : [];
    } catch (ex) {
        console.error("Error al cargar carrito: ", ex);
        return [];
    }
};


//métodos para el login


//métodos para los pokemones