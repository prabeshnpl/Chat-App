from django.http import HttpResponse
class SimpleMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Code to execute for each request before the view is called.
        response = self.get_response(request)
        # Code to execute for each response after the view is called.
        return response
    
    def process_exception(self, request, exception):
        # Handle exceptions here
        print(f"Exception occurred: {exception}")
        return HttpResponse(f"An error occurred:{exception}", status=500)
