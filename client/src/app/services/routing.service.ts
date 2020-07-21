import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RoutingService {
  private REST_API_SERVER = "http://localhost:3000";
  constructor(private http: HttpClient) { }

  nodeRegistryAdminUpdateLogic(network: string, contractAddress: string) {
    return this.http.post<any>(this.REST_API_SERVER + '/noderegistrylogic/admin/update/logic', {
      network,
      newLogic: contractAddress,
    });
  }

  nodeRegistryAdminRemoveNodeFromRegistry(network: string, signerAddress: string) {
    return this.http.post<any>(this.REST_API_SERVER + '/noderegistrylogic/admin/remove/node', {
      network,
      signer: signerAddress,
    });
  }

  nodeRegistryRegisterNode(params) {
    return this.http.post<any>(this.REST_API_SERVER + '/noderegistrylogic/register/node', params);
  }

  nodeRegistryActivateNewLogicContract(params) {
    return this.http.post<any>(this.REST_API_SERVER + '/noderegistrylogic/activate/new/logic/contract', params);
  }

  nodeRegistryLogicReturnDeposits(params) {
    return this.http.post<any>(this.REST_API_SERVER + '/noderegistrylogic/return/deposits', params);
  }

  nodeRegistryLogicTransferIN3NodeOwnership(params) {
    return this.http.post<any>(this.REST_API_SERVER + '/noderegistrylogic/transfer/ownership', params);
  }

  nodeRegistryLogicUpdateIN3Node(params) {
    return this.http.post<any>(this.REST_API_SERVER + '/noderegistrylogic/update/node', params);
  }

  nodeRegistryLogicUnregisterIN3Node(params) {
    return this.http.post<any>(this.REST_API_SERVER + '/noderegistrylogic/unregister/node', params);
  }
}
