export interface UserDTO {
    firstName: String,
    lastName: String,
    phone: {
        type: String,
        index: true,
        background: true
    }
}
