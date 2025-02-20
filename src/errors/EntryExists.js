export class EntryExistsError extends Error {
    static message = "Already exists in database!";
    static code = "ENTRY_EXISTS";

    constructor() {
        super(EntryExistsError.message);
    }
}
