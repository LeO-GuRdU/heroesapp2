import { Component, OnInit } from '@angular/core';
import { HeroesService } from '../../services/heroes.service';
import { FormControl, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Hero, Publisher } from '../../interfaces/hero.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, switchMap, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styles: [],
})
export class NewPageComponent implements OnInit {
  public heroForm = new UntypedFormGroup({
    id: new FormControl<string>(''),
    superhero: new FormControl<string>(''),
    publisher: new FormControl<Publisher>(Publisher.MarvelComics),
    alter_ego: new FormControl<string>(''),
    first_appearance: new FormControl<string>(''),
    characters: new FormControl<string>(''),
    alt_img: new FormControl<string>(''),
  });
  public publishers = [
    { id: 'DC Comics', value: 'DC - Comics' },
    { id: 'Marvel Comics', value: 'Marvel - Comics' },
  ];

  constructor(
    private heroesService: HeroesService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private snackbar: MatSnackBar,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    if (this.router.url.includes('edit')){
      this.activatedRoute.params
        .pipe(switchMap(({ id }) => this.heroesService.getHeroeById(id)))
        .subscribe((hero) => {
          if (!hero) return this.router.navigateByUrl('/');
  
          this.heroForm.reset(hero);
          return;
        });
    }
  }

  get currentHero(): Hero {
    const hero = this.heroForm.value as Hero;
    return hero;
  }

  onSubmit(): void {
    if (this.heroForm.invalid) {
      return this.showSnackbar('Error');
    }
    if (this.currentHero.id) {
      this.heroesService.updateHero(this.currentHero).subscribe((hero) => {
        this.router.navigate(['/heroes/list'])
        this.showSnackbar(`${hero.superhero} updated`);
      });
      return;
    }

    this.heroesService.addHero(this.currentHero).subscribe((hero) => {
      this.router.navigate(['/heroes/edit', hero.id]);
        this.showSnackbar(`${hero.superhero} created`);
    });
  }

onDeleteHero(){
  if(!this.currentHero.id) throw Error ('Hero id is required');

  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    data: this.heroForm.value,
  });

  dialogRef.afterClosed().pipe(
    filter( (result: boolean) => result),
    switchMap(() => this.heroesService.deleteHeroById(this.currentHero.id)),
    filter( (wasDeleted : boolean) => wasDeleted)
  ).subscribe(() => this.router.navigate(['/heroes']));

  // dialogRef.afterClosed().subscribe(result => {
  //   if(!result) return;
    
  //   this.heroesService.deleteHeroById(this.currentHero.id).subscribe( resp => {
  //     if(resp) this.router.navigate(['/heroes']);
  //   });
  // });
}

  showSnackbar(message:string): void{
    this.snackbar.open(message, 'Ok',{ duration: 2500});
  }
}
