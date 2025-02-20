function OauthMiddleware(_request, response, next) {
    response.header("Cache-Control", "no-cache, no-store, must-revalidate");
    response.header("Pragma", "no-cache");
    response.header("Expires", 0);

    next();
}

export default OauthMiddleware;
