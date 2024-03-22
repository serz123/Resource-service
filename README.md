# Resource service

The Resource Service is a RESTful API responsible for managing resources in the system. It follows the API documentation provided at the following link: [https://courselab.lnu.se/picture-it/api/v1/docs/].


In a microservice architecture, it is recommended that each service runs its instance of MongoDB, even if it is possible to use the same one or an existing one on the production server. This helps to decouple services and make them easier to develop, deploy, and scale independently. To achieve this, you can start different containers of the same image on the production server or localhost, and let the Resource Service connect to port 27017.


You can get your authorization token by registering and logging in here: [https://github.com/serz123/Auth-service](https://github.com/serz123/Auth-service)
