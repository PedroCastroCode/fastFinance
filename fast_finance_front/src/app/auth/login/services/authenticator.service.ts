import { environment } from "@/routes/enviroments.router";
import axios, { AxiosResponse } from "axios";

class AuthenticationService {
  public post<TRequest, TResponse>(
    body: TRequest
  ): Promise<AxiosResponse<TResponse>> {
    return axios.post<TResponse>(environment.api_url + "login", body);
  }

  /*public validated_token<TResponse>(): Promise<AxiosResponse<TResponse>> {
    return axios.get<TResponse>(environment.api_url + "profiles", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
  }*/
}

const service = new AuthenticationService();
export default service;
