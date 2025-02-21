function RequireSelfMiddleware(request, response, next) {
    if (request.id !== request.params.id && request.role !== "ADMIN") {
        return response.sendStatus(403);
    }
    next();
}

export default RequireSelfMiddleware;
