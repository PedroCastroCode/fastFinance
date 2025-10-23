import { environment } from '@/routes/enviroments.router';
import axios, { AxiosResponse } from 'axios';
import Cookies from "js-cookie";

export abstract class BaseService {
    protected abstract get resourceName(): string;

    protected get<TResponse>(relativeUrl: string, params?: any): Promise<AxiosResponse<TResponse>> {
        return axios.get<TResponse>(this.buildUrl(relativeUrl), {
            params,
            headers: {
                Authorization: 'Bearer ' + Cookies.get('Token'),
            },
        });
    }

    protected post<TRequest, TResponse>(body: TRequest): Promise<AxiosResponse<TResponse>> {
        return axios.post<TResponse>(this.buildUrl(), body, {
            headers: {
                Authorization: 'Bearer ' + Cookies.get('Token'),
            },
        });
    }

    protected postWithId<TRequest, TResponse>(body: TRequest, id: string): Promise<AxiosResponse<TResponse>> {
        return axios.post<TResponse>(this.buildUrl() + id, body, {
            headers: {
                Authorization: 'Bearer ' + Cookies.get('Token'),
            },
        });
    }

    protected put<TRequest, TResponse>(
        relativeUrl: string,
        body: TRequest
    ): Promise<AxiosResponse<TResponse>> {
        return axios.put<TResponse>(this.buildUrl(relativeUrl), body, {
            headers: {
                Authorization: 'Bearer ' + Cookies.get('Token'),
            },
        });
    }

    protected patch<TRequest, TResponse>(
        relativeUrl: string,
        body: TRequest
    ): Promise<AxiosResponse<TResponse>> {
        return axios.patch<TResponse>(this.buildUrl(relativeUrl), body, {
            headers: {
                Authorization: 'Bearer ' + Cookies.get('Token'),
            },
        });
    }

    protected delete(relativeUrl: string): Promise<AxiosResponse<void>> {
        return axios.delete<void>(this.buildUrl(relativeUrl), {
            headers: {
                Authorization: 'Bearer ' + Cookies.get('Token'),
            },
        });
    }
    protected deleteByIds(relativeUrl: string, body: any): Promise<AxiosResponse<void>> {
        return axios.delete<void>(this.buildUrl(relativeUrl), {
            headers: {
                Authorization: 'Bearer ' + Cookies.get('Token'),
            },
            data: body, // Inclui o corpo da requisição DELETE
        });
    }

    protected deleteWithReason(relativeUrl: string, body: any): Promise<AxiosResponse<void>> {
        return axios.delete<void>(this.buildUrl(relativeUrl), {
            headers: {
                Authorization: 'Bearer ' + Cookies.get('Token'),
            },
            data: body, // Inclui o corpo da requisição DELETE
        });
    }

    protected getFile(relativeUrl: string): Promise<AxiosResponse<Blob>> {
        return axios.get<Blob>(this.buildUrl(relativeUrl), {
            headers: {
                Authorization: 'Bearer ' + Cookies.get('Token'),
            },
            responseType: 'blob',
        });
    }
    protected forgotPassword<TResponse>(email: string): Promise<AxiosResponse<TResponse>> {
        return axios.patch<TResponse>(`${environment.api_url}users/forgot-password`, email, {
            headers: {
                Authorization: 'Bearer ' + Cookies.get('Token'),
            },
        });
    }
    private buildUrl(relativeUrl: string = ''): string {
        return `${environment.api_url}${this.resourceName}/${relativeUrl}`;
    }
}
