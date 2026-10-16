import { Component, OnInit, ViewChild } from '@angular/core';
import { DummyService } from '../../service/dummy/dummy.service';
import { MaterialModule } from '../../modules/material.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Product } from '../../service/dummy/model/product';
import { ProductEditDialogComponent } from '../product-edit-dialog/product-edit-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-demo',
  imports: [ MaterialModule ],
  templateUrl: './demo.component.html',
  styleUrl: './demo.component.scss'
})
export class DemoComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;

  dataSource: MatTableDataSource<Product> = new MatTableDataSource<Product>([]);
  displayedColumns: string[] = ['title', 'price', 'stock'];
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 30, 100];
  pageIndex: number = 0
  totalLength: number = 0;
  isLoading: boolean = false;
  filterValue: string = '';
  hasSearch: boolean = false;
  features: string[] = ['Real-time search', 'Sorting', 'Pagination', 'CRUD', 'REST API', 'Responsive'];
  constructor(
    private dummyService: DummyService,
    private dialog: MatDialog
  ) { 
    this.searchProducts();

  }


  ngOnInit(): void {

  }
  
  getProducts() {
    this.isLoading = true;
    this.filterValue = '';
    this.applyFilter(this.filterValue)
    this.dummyService.getProducts(this.pageSize, this.pageIndex * this.pageSize).subscribe(data => {
      this.dataSource.sort = this.sort;
      this.dataSource.data = data.products;
      
      this.totalLength = data.total;
      this.isLoading = false;
    })
  }

  searchProducts() {
    this.isLoading = true;

    this.dummyService.searchProducts(this.filterValue, this.pageSize, this.pageIndex * this.pageSize).subscribe(data => {
      this.dataSource.sort = this.sort;
      this.dataSource.data = data.products;
      
      this.totalLength = data.total;
      this.isLoading = false;

    })
  }

  /** New search from the search form: start again from the first page. */
  onSearch() {
    this.pageIndex = 0;
    this.searchProducts();
  }

  onPageEvent(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    this.searchProducts();
  }

  applyFilter(event: any) {
    const filterValue = event.target ? (event.target as HTMLInputElement).value : event;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addProduct() {
    let newProduct: Product = new Product();
    this.editProduct(newProduct);
  }

  editProduct(product: Product, index?: number) {
    let oriProduct = JSON.stringify(product);
    const dialogRef = this.dialog.open(ProductEditDialogComponent, {
      minWidth: '40%',
      maxWidth: '100%',
      disableClose: true,
      data: {
        product: product,
        title: product.id > 0 ? product.title : 'New Product' 
      }
    });

    dialogRef.afterClosed().subscribe((response: any) => {

      if(!response.save){
        if(index != undefined){
          let tempTableData = this.dataSource.data;
          tempTableData[index] = JSON.parse(oriProduct);
          this.dataSource.data = tempTableData;
        }
      } else {
        if(index == undefined){
          let tempTableData = this.dataSource.data;
          tempTableData.unshift(product);
          this.dataSource.data = tempTableData;
        }
      }
    });
    
  }

}
