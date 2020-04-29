# Task App

An app for task management. This is application is based on the Task App built in [this course](https://www.udemy.com/course/the-complete-nodejs-developer-course-2/).


## Key takeaways

* If you're using MongoDB middlewares for validation, make sure to use Mongoose methods that won't bypass them.

* When changing a Mongoose model property to 'unique', make sure to drop the database for changes to take place.

* You can overwrite the `toJSON()` method of an object if you want to hide data. This method is called by `JSON.stringify()`, which is widely used.

## To-dos

* Properly handle request vs. server errors.

* Restrict file upload by mimetype, rather than extension.