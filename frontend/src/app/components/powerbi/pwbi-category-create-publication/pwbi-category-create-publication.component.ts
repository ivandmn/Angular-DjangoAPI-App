import { Component, OnInit} from '@angular/core';
import { PowerbiService } from 'src/app/services/powerbi.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { PowerbiH } from 'src/app/models/powerbi-h.model';
import { User } from 'src/app/models/user.model';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-pwbi-category-create-publication',
  templateUrl: './pwbi-category-create-publication.component.html',
  styleUrls: ['./pwbi-category-create-publication.component.css']
})
export class PwbiCategoryCreatePublicationComponent implements OnInit {

  //Variable to save current user info
  current_user: User = this.authService.getUserInfo();
  //Variable to save actual powerbi category code
  pwbiCategoryCode: number | null = this.pwbiService.getPowerBiCategoryIdFromCookies();
  //Variable to actual powerbi category
  pwbiCategory: PowerbiH = new PowerbiH();

  //Create publication form
  publicationPoweBi: FormGroup = new FormGroup({
    doc_entry: new FormControl({value:null, disabled:true}, [Validators.required]),
    type: new FormControl('news', [Validators.required]),
    summary: new FormControl('', [Validators.required]),
    title: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    video: new FormControl(''),
    newness: new FormControl(true, [Validators.required]),
  });

  constructor(private pwbiService: PowerbiService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.pwbiService.getPowerBiCategory(this.pwbiCategoryCode).subscribe({
      next: (response: any) => {
        this.pwbiCategory = response
        this.publicationPoweBi.controls['doc_entry'].patchValue(this.pwbiCategory.id)
      }
    });

  }

  createPublication(): void {
    let publication = this.publicationPoweBi.getRawValue()
    if(publication['newness'] = true){
      publication['newness'] = 1
    } else {
      publication['newness'] = 0
    }
    this.pwbiService.createPowerBiPublication(publication).subscribe({
      next: (response: any) => {
        this.router.navigateByUrl('pwbi/category')
      }
    }); 
  }
}
