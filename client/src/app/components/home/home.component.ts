import { Component, OnInit, Input } from '@angular/core';
import { RoutingService } from './../../services/routing.service'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  success: boolean = false;
  failure: boolean = false;

  constructor(
    private routingService: RoutingService,
  ) {

  }

  ngOnInit(): void {
  }

  // UPDATE LOGIC VARIABLES
  updateNetwork: string;
  contractAddress: string;
  adminUpdateLogicLoaded: boolean = true;

  /**
   * Function to update logic
   */
  adminUpdateLogic() {
    this.adminUpdateLogicLoaded = false;
    this.routingService.nodeRegistryAdminUpdateLogic(
      this.updateNetwork.toUpperCase(), this.contractAddress
    ).subscribe(data => {
      if (data.status === 'success') {
        this.adminUpdateLogicLoaded = true;
        this.success = true;
      } else {
        this.adminUpdateLogicLoaded = true;
        this.failure = true;
      }
    });
  }

  // REMOVE NODE FROM REGISTRY VARIABLES
  removeNetwork: string;
  signerAddress: string;
  adminRemoveNodeFromRegistryLoaded: boolean = true;
  /**
   * Function to remove an IN3-Node from the Registry
   */
  adminRemoveNodeFromRegistry() {
    this.adminRemoveNodeFromRegistryLoaded = false;
    this.routingService.nodeRegistryAdminRemoveNodeFromRegistry(
      this.removeNetwork.toUpperCase(), this.signerAddress
    ).subscribe(data => {
      if (data.status === 'success') {
        this.adminRemoveNodeFromRegistryLoaded = true;
        this.success = true;
      } else {
        this.adminRemoveNodeFromRegistryLoaded = true;
        this.failure = true;
      }
    });
  }

  // REGISTER NODE VARIABLES
  privateKey: string;
  url: string;
  props: number;
  weight: number;
  minimumDeposit: number;
  registerNetwork: string;
  registerNodeInRegistryLoaded: boolean = true;
  /**
   * Function to register a node
   */
  registerNodeInRegistry() {
    this.registerNodeInRegistryLoaded = false;
    this.routingService.nodeRegistryRegisterNode({
      privateKey: this.privateKey,
      url: this.url,
      props: this.props,
      weight: this.weight,
      minimumDeposit: this.minimumDeposit,
      to: '',
      network: this.registerNetwork.toUpperCase()
    }
    ).subscribe(data => {
      if (data.status === 'success') {
        this.registerNodeInRegistryLoaded = true;
        this.success = true;
      } else {
        this.registerNodeInRegistryLoaded = true;
        this.failure = true;
      }
    });
  }

  // ACTIVATE NEW LOGIC VARIABLES
  activateNewLogicPrivateKey: string;
  activateNewLogicNetwork: string;
  activateNewLogicContractLoaded: boolean = true;

  /**
   * Function to activate new logic contract
   */
  activateNewLogicContract() {
    this.activateNewLogicContractLoaded = false;
    this.routingService.nodeRegistryActivateNewLogicContract({
      privateKey: this.activateNewLogicPrivateKey,
      network: this.activateNewLogicNetwork.toUpperCase()
    }
    ).subscribe(data => {
      if (data.status === 'success') {
        this.activateNewLogicContractLoaded = true;
        this.success = true;
      } else {
        this.activateNewLogicContractLoaded = true;
        this.failure = true;
      }
    });
  }

  // RETURN DEPOSITS VARIABELS
  returnDepositsSigner: string;
  returnDepositsOwnerPrivateKey: string;
  returnDepositsNetwork: string;
  returnDepositsLoaded: boolean = true;
  /**
   * Function to return deposits of a signer
   */
  returnDeposits() {
    this.returnDepositsLoaded = false;
    this.routingService.nodeRegistryLogicReturnDeposits({
      signer: this.returnDepositsSigner,
      network: this.returnDepositsNetwork.toUpperCase(),
      ownerPrivateKey: this.returnDepositsOwnerPrivateKey
    }
    ).subscribe(data => {
      if (data.status === 'success') {
        this.returnDepositsLoaded = true;
        this.success = true;
      } else {
        this.returnDepositsLoaded = true;
        this.failure = true;
      }
    });
  }

  // TRANSFER IN3 NODE OWNERSHIP VARIABLES
  transferIN3NodeOwnershipSigner: string;
  transferIN3NodeOwnershipNewOwner: string;
  transferIN3NodeOwnershipNetwork: string;
  transferIN3NodeOwnershipOwnerPrivateKey: string;
  transferIN3NodeOwnershipLoaded: boolean = true;
  /**
   * Function to transfer node ownership
   */
  transferIN3NodeOwnership() {
    this.transferIN3NodeOwnershipLoaded = false;
    this.routingService.nodeRegistryLogicTransferIN3NodeOwnership({
      signer: this.transferIN3NodeOwnershipSigner,
      newOwner: this.transferIN3NodeOwnershipNewOwner,
      network: this.transferIN3NodeOwnershipNetwork.toUpperCase(),
      ownerPrivateKey: this.transferIN3NodeOwnershipOwnerPrivateKey
    }
    ).subscribe(data => {
      if (data.status === 'success') {
        this.transferIN3NodeOwnershipLoaded = true;
        this.success = true;
      } else {
        this.transferIN3NodeOwnershipLoaded = true;
        this.failure = true;
      }
    });
  }

  // UPDATE NODE VARIABLES
  updateIN3NodeSigner: string;
  updateIN3NodeURL: string;
  updateIN3NodeProps: number;
  updateIN3NodeWeight: string;
  updateIN3NodeAdditionalDeposit: number;
  updateIN3NodeNetwork: string;
  updateIN3NodeOwnerPrivateKey: string;
  updateIN3NodeLoaded: boolean = true;
  /**
   * Function that updates a node
   */
  updateIN3Node() {
    this.updateIN3NodeLoaded = false;
    this.routingService.nodeRegistryLogicUpdateIN3Node({
      signer: this.updateIN3NodeSigner,
      url: this.updateIN3NodeURL,
      props: this.updateIN3NodeProps,
      weight: this.updateIN3NodeWeight,
      additionalDeposit: this.updateIN3NodeAdditionalDeposit,
      network: this.updateIN3NodeNetwork.toUpperCase(),
      ownerPrivateKey: this.updateIN3NodeOwnerPrivateKey
    }
    ).subscribe(data => {
      if (data.status === 'success') {
        this.updateIN3NodeLoaded = true;
        this.success = true;
      } else {
        this.updateIN3NodeLoaded = true;
        this.failure = true;
      }
    });
  }

  // UNREGISTE IN3 NODE VARIABLES
  unregisterIN3NodeSigner: string;
  unregisterIN3NodeOwnerPrivateKey: string;
  unregisterIN3NodeNetwork: string;
  unregisterIN3NodeLoaded: boolean = true;
  /**
   * Function to unregister an IN3 node
   */
  unregisterIN3Node() {
    this.unregisterIN3NodeLoaded = false;
    this.routingService.nodeRegistryLogicUnregisterIN3Node({
      signer: this.unregisterIN3NodeSigner,
      network: this.unregisterIN3NodeNetwork.toUpperCase(),
      ownerPrivateKey: this.unregisterIN3NodeOwnerPrivateKey
    }
    ).subscribe(data => {
      if (data.status === 'success') {
        this.unregisterIN3NodeLoaded = true;
        this.success = true;
      } else {
        this.unregisterIN3NodeLoaded = true;
        this.failure = true;
      }
    });
  }

}
