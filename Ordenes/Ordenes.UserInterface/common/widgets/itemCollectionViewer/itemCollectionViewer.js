/* Opcenter Execution Foundation V2507 | Copyright (C) Siemens AG 2025. All Rights Reserved. */
/**
 * @ngdoc module
 * @name siemens.simaticit.common.widgets.itemCollectionViewer
 *
 * @description
 * This module provides functionalities to show a collection of items as a **grid** or **tiles**.
 * Depends on the following modules
	 * * **siemens.simaticit.common.widgets.grid**
	 * * **siemens.simaticit.common.widgets.tiles**
	 * * **siemens.simaticit.common.widgets.viewBar**
	 * * **siemens.simaticit.common.widgets.filterBar**
	 * * **siemens.simaticit.common.widgets.pager**
 *
 */
(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.itemCollectionViewer', [
        'siemens.simaticit.common.widgets.grid',
        'siemens.simaticit.common.widgets.tiles',
        'siemens.simaticit.common.widgets.viewBar',
        'siemens.simaticit.common.widgets.filterBar',
        'siemens.simaticit.common.widgets.pager',
        'siemens.simaticit.common.widgets.tagsManager'
    ]);

})();

/*jshint -W098 */
(function () {
    'use strict';
    //#region ng-doc comments
    /**
    * @ngdoc type
    * @name ICVOptions
    * @module siemens.simaticit.common.widgets.itemCollectionViewer
    * @description An object containing the configuration settings for the Item Collection Viewer.
    * @property {String} [containerID=undefined] Identifies the ID of the element that contains the item collection viewer and is used to set the height of the ICV container.
    * @property {Boolean} [useCustomColors="false"] _(Optional)_ Specifies whether the system uses the specified custom colors when the tiles are shown.
    * @property {String} [bgColor=undefined] _(Optional)_ Represents the custom background color for non-selected tiles,
    * either as a CSS color value or name (e.g. 'red' or '#647887').
    * @property {String} [bgColorSelected=undefined] _(Optional)_ Represents the custom background color for selected tiles,
    * either as a CSS color value or name (e.g. 'red' or '#647887').
    * @property {String} [color=undefined] _(Optional)_ Represents the custom foreground color for non-selected tiles,
    * either as a CSS color value or name (e.g. 'red' or '#647887').
    * @property {String} [colorSelected=undefined] _(Optional)_ Represents the custom foreground color for selected tiles,
    * either as a CSS color value or name (e.g. 'red' or '#647887').
    * @property {String} svgIcon _(Optional)_ Represents the svg icon that has to be displayed in the tile or grid.
      This can be overriden by the icon specified in the tile or grid data.
    * @property {String} typeIcon _(Optional)_ Represents the type icon that has to be displayed in the tile or grid.
      This can be overriden by the icon specified in the tile or grid data. svg icon is given higher priority over type icon.
    * @property {Object} [gridConfig=undefined] Contains settings for displaying data items as a grid.
    * It supports the following grid configuration options:
    * * **columnDefs**: An array of objects that specifies which columns are displayed in the grid. For a full description, see {@link ColumnDef}
    * * **showSelectionCheckbox**: Determines if a check box is shown in the first column to indicate selection state.
    * If true the checkbox is displayed on the left side of the grid. If false, the check box is hidden. _(default: false)_
    * * **showRowHighlight**: Determines if selected rows are highlighted. _(default: true)_
    * * **customRowClasses** : Specifies the CSS classes to be used for customized styling of the grid rows. The following options are supported.
    *   * **even**:Specifies the class to be used for even numbered rows.
    *   * **odd**:Specifies the class to be used for odd numbered rows.
    *   * **selected**:Specifies the class to be used for selected rows.
    *
    * Example:
    * ```
    * gridConfig: {
    *     columnDefs: [
    *         { field: 'title', displayName: 'Title' },
    *         { field: 'author', displayName: 'Author', resizable: false },
    *         { field: 'yearPublished', displayName: 'Year' },
    *         { field: 'subTitle', displayName: 'Sub Title' }
    *     ],
    *     showSelectionCheckbox: true,
    *     showRowHighlight: true,
    *     customRowClasses:{
    *         even: 'myEvenRowClass',
    *         odd: 'myOddRowClass',
    *         selected: 'mySelectedRowClass'
    *     }
    * },
    * ```
    * Example of displaying command button inside a grid column:
    * ```
    * gridConfig: {
    *     columnDefs: [
    *         { field: 'NId', displayName: 'NId',
    *           onClickCallback:function(row){ //business logic to execute on click of command button },
    *           cellTemplate: '<navigation-cell-template row="row.entity" field-value="{{row.getProperty(col.field)}}" sit-options="col.colDef.onClickCallback">'+
    *                         '</navigation-cell-template>'
    *         }
    *     ]
    * }    
    * ```
    * A custom directive template code that can be used to show a open command button inside grid column:
    * ```
    * <div class="ngCellText">
    *     <div ng-class="col.colIndex()">
    *        <div title="{{vm.getFieldValue()}}">{{vm.getFieldValue()}}</div>
    *     </div>
    *     <div ng-class="col.colIndex()">
    *       <img alt="" src="common/icons/cmdOpen24.svg" ng-click="vm.callOnNavigateButtonClick()" />
    *     </div>
    * </div>   
    * ```
    * A custom directive controller code that can be used to show a open command button inside grid column:
    * ```
    * (function () {
    * 'use strict';
    * angular.module('ModuleName').directive('navigationCellTemplate', navigationCellTemplateDirective);
    *
    * function navigationCellTemplateDirective() {
    *   return {
    *        templateUrl: '../navigation-cell-template.directive.html',
    *        controller: navigationCellTemplateController,
    *        restrict: 'E',
    *        controllerAs: 'vm',
    *        scope: {},
    *        bindToController: {
    *            fieldValue: '@',
    *            row: '=',
    *            onNavigateButtonClick: '=?sitOptions'
    *        }
    *     }
    *  }
    *
    * function navigationCellTemplateController() {
    *    var vm = this;
    *
    *    activate();
    *
    *    function activate() {
    *        init();
    *   }
    *
    *    function init() {
    *        vm.getFieldValue = getFieldValue;
    *        vm.callOnNavigateButtonClick = callOnNavigateButtonClick;
    *    }
    *
    *    function getFieldValue() {
    *        return vm.fieldValue;
    *    }
    *
    *    function callOnNavigateButtonClick() {
    *        vm.onNavigateButtonClick(vm.row);
    *    }
    *   }
    *  })();
    *
    * ```
    * @property {Object} [tileConfig=undefined] Contains settings for displaying text on tiles.
    * It supports the following tile configuration options:
    *  * **titleField**: Specifies the name of the field to use for the title text when the tiles are shown.
    *    
    *  * **titleFieldSource**:  (_Optional_) The unique alias key configured in **fieldSources** of serverDataOptions.
    *  This property is configured if the **titleField** property belongs to the facet type extension. This property is considered only when server-side configuration is used.    
    *
    *  * **titleFieldFilter**:  (_Optional_) Specifies the format to display the  **titleField** in **date** format.
    *  The configuration object accepts two properties:
    *   * **dataType**: Type of field mapped to **titleField**.It supports only 'date' type formatting.
    *   * **format**: The date-time format to be displayed on tile title. Default format is 'mediumDate'.
    *
    *  * **descriptionField**: Specifies the name of the field to be used for the description text of tiles.
    * If specified, the value of this field is retrieved and displayed in the tile.
    *
    *  * **descriptionFieldSource**:  (_Optional_) The unique alias key configured in **fieldSources** of serverDataOptions.
    *  This property is configured if the **descriptionField** property belongs to the facet type extension. This property is considered only when server-side configuration is used.    
    *
    *  * **descriptionFieldFilter**:  (_Optional_) Specifies the format to diaplay the **descriptionField** in **date** format.
    *  The configuration object accepts two properties:
    *   * **dataType**: Type of data mapped to **descriptionField**. It supports only 'date' type formatting.
    *   * **format**: The date-time format to be displayed on tile description. Default format is 'mediumDate'.
    *
    *  * **propertyFields**: Defines the list of field objects to be displayed as properties in a tile.
    *  The field configuration object accepts four properties as shown below:
    *   * **field**: The field name of the data object which has to be displayed as property in tile.
    *   * **displayName**: The label for the tile property.
    *   * **dataType**: (_Optional_) The 'type' of the field. 
    *   This property is set only when a formatting has to be applied on the display value. It is used only for **date** type fields.
    *   * **fiedSource**: (_Optional_) The unique alias key configured in **fieldSources** of serverDataOptions.
    *  This property is configured if the **field** property belongs to the facet type extension. This property is considered only when server-side configuration is used.    
    * 
    *   * **format**:  (_Optional_) The date-time format to be displayed on tile property. Default format is 'mediumDate'.
    *   
    *  * **isCell**: If set to true:
    *   * It is possible to specify up to four properties (even in case of compact mode tiles).
    *   * It is possible to display the list of data segregation tags (even in case of compact mode tiles).
    *   * If not specified default behaviour is applied as follows(medium - 2 properties ,wide - 3 properties, large - 4 properties)
    *
    *  * **indicators**: If set to an array (of zero or more elements), an extra row is added to the tile to display zero or more indicators.
    * Each object of the array must have the following properties.
    *   * **svgIcon**: The name of the SVG icon to display as an indicator.
    *   * **visible **: This specifies whether the indicator is visible or not. This property can be set to an expression string or a function that will be evaluated in the context of each tile.
    *   * **tooltip**: The translated string to be displayed as a tooltip on mouse hover.
    *
    *
    *  * **commands**: If set to an array, up to two commands can be configured.
    * Each object of the array must have the following properties.
    *   * **img**: The name of a valid FontAwesome icon class. If neither this nor cmdIcon is specified, this property will be set to fa-share-square-o.
    *   * **cmdIcon**: The name of the SVG command icon to display as an indicator .If specified, this property overrides **img**.
    *   * **onClick**: A function to be called when the button is clicked.
    *   * **tooltip**: The tooltip to display on mouse hover.
    *   * **visible **:  If set to false, the command button is hidden (default: true).
    * This property can be set to an expression string or a function that will be evaluated in the context of each tile.
    *
    *
    * The list of the fields as objects should be provided as localized names for the text label.
    * By default, the field name is used. For example:
    * ```
    * {
    *      isCell: true,
    *      titleField:'title',
    *      descriptionField:'subTitle' ,
    *      propertyFields: [
    *          { field: 'datePublished', displayName: 'Published On', dataType:'date', format:'medium' },
    *          { field: 'myCustomData'},
    *      ],
    *      commands: [
    *                    {
    *                       img: 'fa-pencil',
    *                       cmdIcon: '2Dview',
    *                       onClick: function () { console.log('command 1 called'); },
    *                       tooltip: 'command 1',
    *                       visible: function(tile){ return tile.status === 'New'}
    *                    },
    *                    {
    *                       img: 'fa-pencil',
    *                       cmdIcon: '2Dview',
    *                       onClick: function () { console.log('command 2 called'); },
    *                       tooltip: 'command 2',
    *                       visible: 'tile.status === 'New'
    *                    }
    *                ] ,
    *      indicators: [
    *                       { svgIcon : 'common/icons/indicatorCompleted16.svg'  , visible : function(tile){ return tile.status === 'New', tooltip : $translate.instant('common.new')},
    *                       { svgIcon : 'common/icons/indicatorCompleted16.svg' , visible : 'tile.status === 'Completed', tooltip: $translate.instant('common.completed')}
    *                  ]
    * }
    * ```
    * If object notation is used and the **displayName** is not specified, the field is used as the label.
    *
    * This tile configuration property also supports field names with **dot** notation for displaying text on tiles.
    *
    * Example:
    * ```
    * {
    *     titleField:'title',
    *     titleFieldSource: 'Ftitle',
    *     descriptionField: 'myCustomData.like',
    *      propertyFields: [
    *          { field: 'myCustomData.like', displayName: 'Published' },
    *          { field: 'myCustomData.soldout'},
    *      ]
    * }
    * ```
    * @property {Boolean}  [enablePaging=true] _(Optional)_ Specifies if the pager should be displayed or not in the UI.
    * If it is set to false and the serverDataOptions property is specified, an infinite scrollbar is displayed: it means that as the user scrolls down the page, data is retrieved from the server and is displayed.
    * @property {Boolean} [alwaysShowPager=false] _(Optional)_ Specifies if the pager is always shown.
    * The default behavior hides the pager if the number of items to show is less than the page size. This option allows a user to override that behavior.
    * @property {Boolean} [noScroll=false] _(Optional)_ Specifies if the scroll bar for the ICV content should be displayed or hidden.
    * @property {Object} pagingOptions _(Optional)_ Contains the options to configure the pager.
    * The object contains the following properties.
    * * **type** : Defines the type of pagination.It can be either 'simple' or  'standard' or 'extended'. If the type is not mentioned, then by default 'extended' is considered.
    * * **pageSize**: The number of items to display per page. It can be one of the following values : 10,25,50 or 100.
    * ```
    * {
    *     pageSize: 10,
    *     type: 'standard'
    * }
    * ```
    *
    * @property {String} [filterBarOptions=sqg] Specifies the options to be displayed in the filter bar.
    * It supports the following configuration options:
    *  * **S**: Sorting
    *  * **Q**: Quick Search
    *  * **F**: Filtering
    *  * **G**: Grouping
    *
    ***NOTE:** Values are not case sensitive.
    * @property {Array<Object>} [filterFields=undefined] Defines the data fields that should be used for filtering data.
    * For a full description , see {@link FilterField}
    *
    * Example:
    * ```
    * [
    *     {
    *         field: 'title',
    *         displayName: 'Title',
    *         type: 'string',
    *         default: true
    *     },
    *     {
    *         field: 'author',
    *         displayName: 'Author',
    *         type: 'string',
    *         default: true
    *     }
    * ]
    * 
    * ```
    * 
    ***NOTE:**
    *       ICV Limitation - When we try to make a query in ICV for filtering the data using fields, 
    *                        make sure field should not be an array type. 
    *                        Otherwise, ICV may not guarantee the proper filtering behavior and may end up with errors.
    * 
    * @property {Object} [downloadOptions={enabled:true, separator: ';'}] _(Optional)_ 
    * Defines the options to download the records.
    * This feature is enabled by default.
    * The downloading is available only in **Table** mode and the downloaded file extension is *.csv* by default.
    * 
    * It supports the following configuration options:
    *  * **enabled**: _(Optional)_ A boolean value to enable/disable the downloading functionality.
    *  * **fileName**: _(Optional)_ Name of the downloading file. 
    * A timestamp will be attached automatically to the filename while downloading.
    *  * **separator**: _(Optional)_  A record delimiting symbol, to separate the record columns in the *.csv* file.
    *
    * Example:
    * 
    * ```
    *     {
    *         enabled: false,
    *         fileName: 'Records',
    *         separator: ','
    *     }
    * ```
    * 
    * @property {String} [groupField=undefined] Specifies the name of the field to group by when the item collection is loaded for the first time.
    * 
    * @property {String} [groupFieldSource=undefined] 
    * _(Optional)_ The property is configured if the **groupField** property belongs to the facet type extension.
    * The value should be the unique alias key configured in **fieldSources**.
    * This property works for server-side configuration only.
    *
    * @property {String[] | Object[]} [groupFields] Specifies the list of fields on which group operations should be performed.
    *
    * If the array elements are strings, they represent the field names a user is allowed to group by.
    * These field names are added to a drop-down list in the filter bar of the ICV.
    *
    * ```
    *   groupFields: ['title', 'author']
    * ```
    *
    * To provide more user-friendly names in the drop down, use objects as the array elements.
    * The objects must have the following format:
    * * **field**: defines the field name to use for grouping.
    * * **displayName**: defines the text to be displayed in the drop down.
    * * **fieldSource**: _(Optional)_ The property is configured if the **field** property belongs to the facet type extension.
    * The value should be the unique alias key configured in **fieldSources**.
    * This property works for server-side configuration only.
    *
    * ```
    * [
    *     {
    *         field: 'title',
    *         displayName: 'Title',
    *     },
    *     {
    *         field: 'author',
    *         displayName: 'Author',
    *     },
    *     {
    *         field: 'totalAwards'
    *         displayName: 'Awards'
    *         fieldSource: 'awards'
    *     }
    * ]
    * ```
    * _(default: [ ] )_
    *@property {Object[]} customButtons Specifies the list of custom buttons that needs to be displayed in the filter bar.
    * The buttons will be displayed after the quick search text box or the button(in case of compact mode), if quick search is configured.
    * If not, the custom buttons are displayed before the User preference button or the Segregation tags button.
    * ```
    *   customButtons:[
    *          {
    *                  "type": "Command",
    *                  "label": "Edit",
    *                  "name": "toggleEdit",
    *                  "tooltip": "Edit Material",
    *                  "visibility": false,
    *                  "svgIcon": "common/icons/cmdGroup24.svg",
    *                  "onClickCallback": function(){alert("Custom button 1 successfull");}
    *          },
    *
    *           {
    *               "type": "Command",
    *               "label": "Edit2",
    *               "name": "toggleEdit2",
    *               "tooltip": "Edit Material",
    *               "visibility": true,
    *               "svgIcon": "common/icons/cmdHome24.svg",
    *               "onClickCallback": function(){alert("Custom button 2 successfull");}
    *           }
    *     ],
    * ```
    
    * @property {Number} [height=undefined] _(Optional)_ Specifies a fixed size (in pixels) used to set the height of the widget.
    *
    * When defined, it overrides the height set using the **containerId** property.
    * @property {Number} [rowHeight=30] _(Optional)_ Sets the grid row height.
    * @property {String} [image=undefined] _(Optional)_ The name of a **Font Awesome** icon to use as the default image for tiles.
    *
    * This value is only used if the image property has not been set for the tile.
    *
    * **Note:** It does not override values that are set directly in the tile content.
    *
    * @property {String} [noDataMessage=Localized version of 'No Data'] _(Optional)_ Specifies the message to be displayed when no data is set.
    * @property {Object} [quickSearchOptions=undefined] Defines the options to manage the **Quick Search** behavior.
    *
    * **Quick Search** is implemented by filtering the data collection and showing only the items
    * that match the specified criteria. Filtering is performed on only one configured data field.
    *
    * The object contains the following properties.
    * * **enabled**: Determines if quick search filtering is performed.
    * * **field**: The name of the field on which the search is performed.
    * * **fieldSource**: _(Optional)_ The property is configured if the **field** property belongs to the facet type extension.
    * The value should be the unique alias key configured in **fieldSources**.
    * This property works for server-side configuration only.
    * * **filterText**: The search text to filter against the configured field when the ICV loads.
    * * **displayName**: The string to display as the placeholder for quick search.
    * * **placeholderText**: The custom text to be displayed as the placeholder.
    * 
    * @property {Function} [onPageChangedCallback=undefined] Specifies the function to call when the current page of data is changed.
    * The function is passed with one argument:
    * * **pageNumber**: It represents the new page number.
    *
    * @property {Function} [onSelectionChangeCallback=undefined] Specifies the function to call when the list of selected items changes.
    * The function is passed with two arguments:
    * * **selectedItems** An array of objects that represents the currently selected data items.
    * * **selectedItem** The item a user clicked that triggered the selection change.
    *
    * **Note:** Set to **null** for programmatic selection.
    *
    * @property {Function} [onSortingChangedCallback=undefined]
    * Specifies the function to call when the order of the displayed data changes.
    * The function is passed with one argument:
    * * **fieldName** The field name which is sorted and its direction (asc/desc).
    *
    * @property {String} [selectionMode="multi"] _(Optional)_ Specifies if the user can select only one item, multiple items or no items.
    * The following values are allowed:
    ** **multi**: Multiple items can be selected.
    ** **single**: Only single items can be selected.
    ** **none**: No items can be selected.
    * @property {Object} [serverDataOptions=undefined] Contains settings that define the presentation service and data entity to be used as a data source.
    *
    * The object has the following format:
    * * **dataService**: A presentation service object, such as **engineeringData**.
    * * **dataEntity**: The name of the entity to be retrieved using the service.
    * * **optionsString**: **oData** query options.
    * * **appName**: The name of the App where the entity is defined.
    * * **fieldSources** : _(Optional)_ An object to define the reference of the logical extensions used in **dataEntity**.
    *  This information is used by ICV to process, transform the structure and display the data retrieved from the logical extensions.
    *  The configuration object holds multiple entries of key-value pair based on the available logical extensions.
    *  The key in every entry must be a unique identifier and the value must be a logical extension FQN from metadata.
    *  Currently **facet** extension type is supported by ICV.
    *  
    *  The sample **fieldSoueces** object with single entry is shown below:
    *  ```
    *      {
    *        unique_alias_name: {
    *                              name: 'fully qualified Reading Model name of facet',
    *                              type: 'facet'
    *                           }
    *      }    
    * ```
    *  * The **unique_alias_name** key holds the unique identifier value for **fieldSources** entry.
    *  * The **name** property should be assigned with fully qualified Reading Model name.
    *  * The **type** property specifies the logical extension type.
    * 
    * The sample server configuration object is shown below: 
    * ```
    *     {
    *         dataService: businessDataService,
    *         dataEntity: 'CommandDefinition',
    *         optionsString: '',
    *         appName: 'myApp',
    *         fieldSources: {
    *                         publishers :{
    *                               name: 'myApp.MYPOMModel.DataModel.ReadingModel.FacetPublishers',
    *                               type: 'facet'
    *                              },
    *                         distributors :{
    *                               name: 'myApp.MYPOMModel.DataModel.ReadingModel.FacetDistributors',
    *                               type: 'facet'
    *                               },
    *                         awards :{
    *                               name: 'myApp.MYPOMModel.DataModel.ReadingModel.FacetAwards',
    *                               type: 'facet'
    *                               }
    *                       }
    *     }
    * ```
    *
    * For dynamic data updates, it is necessary to call the {@link ICVOptions refresh} method.
    *
    * For example, the code snippet below updates serverDataOptions and refreshes the ICV dynamically.
    *```
    *            vm.icvGridOptions.serverDataOptions.optionsString = "$filter=(Name eq '" + selectedItem[0].Name + "')";
    *            vm.icvGridOptions.refresh();
    *```
    *
    * @property {Object} [sortInfo=undefined] Defines the fields that are used for sorting as well as the initial sort for the collection.
    *
    * The object has the following format:
    * * **field**: The name of the field on which to sort.
    * * **fieldSource**: _(Optional)_ The property is configured if the **field** property belongs to the facet type extension.
    * The value should be the unique alias key configured in **fieldSources**.
    * This property works for server-side configuration only.
    * * **direction**: The sort direction. Allowed values are:
    *  * **asc** (Ascending)
    *  * **desc** (Descending)
    *  * **fields**: An array of objects that defines the fields that should be used for sorting.
    *
    * ```
    *  {
    *       field: 'author',
    *       direction: 'asc',
    *       fields: [
    *           { field: 'title', displayName: 'Title' },
    *           { field: 'author', displayName: 'Author' },
    *           { field: 'yearPublished', displayName: 'Year' },
    *           { field: 'publishedBooks', displayName: 'Number of Published Books', fieldSource: 'publishers'},
    *       ]
    *  }
    * ```
    *
    * The **fields** array contains objects with **field**, **displayName** and an optional **fieldSource** properties.
    * The **displayName** property allows to set the localized strings that are displayed to a user.
    * The **displayName** property is optional to configure. If not set, the **field** value is used.
    *
    * The **fields** array also supports a list of strings. In this case, the strings represent field names.
    * ```
    * fields: ['title', 'author']
    * ```
    * **Note:** Localization is not supported using this format.
    *
    * @property {Boolean} [enableResponsiveBehaviour=false]
    * Determines if the widget is responsive for different device resolution. If set to true the ICV will rearrange
    * from large to wide and then to medium for **tile views** when the device resolution decreases. For extra small
    * devices the ICV will switch to compact mode.
    *
    * @property {String | Object} [tagField=undefined] Displays Data Segregation tags of the given field.
    * This property is not supported  in **compact** and **small tile** view modes , unless **isCell** property in **tileConfig** is set to true.
    * The property accepts **String** or **Object** type values.
    * * Type **String**: defines the field name to use for tags and the text to be displayed in the column.
    *
    * ```
    *  tagField: 'categories'
    * ```
    * * Type **Object**: This is to provide more user-friendly name in the column. The object must have the following format:
    *
    *  * **field**: defines the field name to use for tags.
    *  * **displayName**: defines the text to be displayed in the column.
    *
    * ```
    *   tagField: { field : 'categories' , displayName : 'Category' }
    *
    * ```
    *
    *
    * @property {String} [userPrefId=undefined] Displays User Personalization icon to personalize the user fields.
    * If this property is not given, the User Personalization icon will not be displayed.
    * This property should be unique with in the page.
    *
    * @property {String} [viewMode="g"] _(Optional)_  Defines the representation of the data when the ICV is loaded.
    *
    * The property value must be one of the following letter codes:
    * * **C**: Puts the ICV in **Compact Mode**.
    * * **G**: Shows data in a Grid (Table).
    * * **S**: Shows data as small tiles. (size **medium** item tile)
    * * **M**: Shows data as medium tiles. (size **wide** item tile)
    * * **L**: Shows data as large tiles. (size **large** item tile)
    *
    * **Note:** The letter codes are not case sensitive.
    *
    * For the Tile, if the user has configured **"s,m,l"**, the default tile will be loaded based on the number of properties in propertyFields.
    *
    * If the number of properties in propertyFields is 1 or 2, it will load small tiles (size **medium** item tile).
    *
    * If the number of properties in propertyFields is 3, it will load medium tiles (size **wide** item tile).
    *
    * If the number of properties in propertyFields is 4 and the isCell property is set to true,
    * it will load medium tiles (size **wide** item tile) and if the isCell property is set to false, it will load large tiles (size **large** item tile).
    *
    * @property {String} [viewOptions="gsmlx"] _(Optional)_  Defines the UI elements to be shown in the view mode.
    *
    * The property value is any combination of the following letter codes:
    * * **G**: Shows the Grid.
    * * **S**: Shows the Small Tile.
    * * **M**: Shows the Medium Tile.
    * * **L**: Shows the Large Tile.
    * * **X**: Shows the selection mode check box.

    * **Note:** The letter codes are not case sensitive.
    *
    * For the Grid, it will display as Table in the view mode.
    *
    * For the Tile, if the user has configured **"s,m,l"** it will display as a List in the view mode. When the List is selected,
    * the tile will be loaded depending on the propertyFields specified in the tileConfig.
    * For more details, refer **viewMode**.
    *
    * @property {String} [gridContainerClass = undefined] _(Optional)_ Applies the defined custom class's style to the grid.
    *
    * @property {String} [tileContainerClass = undefined] _(Optional)_ Applies the defined custom class's style to the tile.
    *
    * @property {String} [smallTileTemplate= undefined] _(Optional)_ A string that contains a custom HTML template, which overrides the contents of the small tile,
    * leaving the dimensions and some behaviors unchanged (e.g. selection).
    *
    * **Note:**
    * * The raw data set to ICV can be accessed via the **itemTileCtrl.tileContent** object (the same name must be used in the template) inside the custom template.
    *
    * For example, if the raw data set to ICV has a property called **myCustomData** , it can be accessed as **itemTileCtrl.tileContent.myCustomData**
    *```
    * <div> <span> {{ itemTileCtrl.tileContent.myCustomData }} </span> </div>
    *
    *```
    *
    * @property {String} [mediumTileTemplate= undefined] _(Optional)_ A string that contains a custom HTML template, which overrides the contents of the medium tile,
    * leaving the dimensions and some behaviors unchanged (e.g. selection).
    *
    * **Note:**
    * * If **tagField** is configured, the available tile space will descrease as some space is used to display data segregation tags.
    * * The raw data set to ICV can be accessed via the **itemTileCtrl.tileContent** object (the same name must be used in the template) inside the custom template.
    *
    * For example, if the raw data set to ICV has a property called **myCustomData** , it can be accessed as **itemTileCtrl.tileContent.myCustomData**
    *```
    * <div> <span> {{ itemTileCtrl.tileContent.myCustomData }} </span> </div>
    *
    *```
    *
    * @property {String} [largeTileTemplate= undefined] _(Optional)_ A string that contains a custom HTML template, which overrides the contents of the large tile,
    * leaving the dimensions and some behaviors unchanged (e.g. selection).
    *
    * **Note:**
    * * If **tagField** is configured, the available tile space will descrease as some space is used to display data segregation tags.
    * * The raw data set to ICV can be accessed via the **itemTileCtrl.tileContent** object (the same name must be used in the template) inside the custom template.
    *
    * For example, if the raw data set to ICV has a property called **myCustomData** , it can be accessed as **itemTileCtrl.tileContent.myCustomData**
    *```
    * <div> <span> {{ itemTileCtrl.tileContent.myCustomData }} </span> </div>
    *
    *```
    * @property {String | Function} [uniqueID=undefined] _(Optional)_
    * The selection highlight mark on the tile/grid will continue to exist after changing the data in the selected tile/grid.
    *
    * The property accepts **String** or **Function** type values.
    * * Type **String**:  The property is passed with a field name. The value of the field name must be constant and unchangable.
    * ```
    *  uniqueID: 'Id',
    * ```
    * * Type **Function**: The property is passed with a function.
    * The function accepts two arguments and the object comparision logic on two arguments is written inside the function.
    * The function must return a boolean value as a result of the comparision.
    * ```
    * uniqueID: function (currentItem, selectedItem) {
    *           if (currentItem.Name === selectedItem.Name) {
    *               return true;
    *               }
    *           return false;
    *          }
    * ```
    * @property {Boolean}  [tagsManager=true] _(Optional)_ Specifies if the Data Segregation Tags Manager should be displayed or not in the UI.
    * @property {Object} [tagsManagerOptions=undefined] _(Optional)_ Contains settings used as a data source to retrive data in client side configuration.
    *
    * The object has the following format:
    * * **entityName**: The name of the entity used to retrive data.
    * * **appName**: The name of the App where the entity is defined.
    *
    * ```
    *     {
    *         entityName: 'myEntity',
    *         appName: 'myApp'
    *     }
    * ```
    *
    * * @property {Boolean}  [exportManager=true] _(Optional)_ Specifies if the Export Manager should be displayed or not in the UI.
    * @property {Object} [exportManagerOptions=undefined] _(Optional)_ Contains settings that are used to retrieve the required data from the client side configuration.
    *
    * The object has the following format:
    * * **entityName**: The name of the entity used to retrieve data.
    * * **appName**: The name of the App where the entity is defined.
    *
    * ```
    *     {
    *         entityName: 'myEntity',
    *         appName: 'myApp'
    *     }
    * ```
    *
    */


    /**
    * @ngdoc directive
    * @module siemens.simaticit.common.widgets.itemCollectionViewer
    * @name sitItemCollectionViewer
    *
    * @requires $log
    *
    *
    *
    * @description
    * Displays a collection of items as tiles or in a grid.
    * Includes UI to filter and sort data, and switch between tile view and grid view.
    *
    * @usage
    * As an element:
    * ```
    * <sit-item-collection-viewer sit-data="viewDataArray"
    *                             sit-options="viewOptionsObject">
    * </sit-item-collection-viewer>
    *
    * ```
    * @restrict E
    *
    * @param {Array<Object>} [sitData] An array of data objects to show as a collection.
    * If **serverDataOptions** are specified in the **sitOptions** parameter, then data is retrieved
    * from a server. Any data items assigned to this property will be ignored.
    *
    *
    * @param {Object} sitOptions For a description of this object see {@link ICVOptions}
    *
    * @example
    * 
    * <h2>sit-item-collection-viewer using client data</h2>
    * 
    * In a view template, you can use the **sitItemCollectionViewer** as follows:
    *  ```
    * <div>
    *     <sit-item-collection-viewer sit-data="icvCtrl.icvConfig.icvData"
    *                                 sit-options="icvCtrl.icvConfig.icvOptions">
    *     </sit-item-collection-viewer>
    * </div>
    * ```
    * The following example shows how to configure a custom style:
    * ```
    * <style>
    *     .grid-container {
    *         width: 1200px;
    *         border-spacing: 2px;
    *     }
    *     .tile-container {
    *         background-color: #EDDCF2;
    *     }
    *     .myEvenRowClass {
    *         background-color:aqua;
    *     }
    *     .myOddRowClass {
    *         background-color:antiquewhite;
    *     }
    *     mySelectedRowClass {
    *         background-color:coral;
    *     }
    * </style>
    * ```
    *
    * The following example shows how to configure a sit-item-collection-viewer widget:
    *
    * In Controller:
    * ```
    * (function () {
    *     'use strict';
    *     var app = angular.module('siemens.simaticit.app');
    *     app.controller('ItemCollectionViewerController', ['$scope', '$timeout', 'debugService', 'common', 'common.services.engineering.data.service',
    *     'common.services.runtime.dataService',
    *     function ($scope, $timeout, debugService, common, engineeringData, businessData) {
    *         var vm = this;
    *         vm.customTemplate = '<div style=\"padding:10px; text-align: right; background-color:#87CEEB; height: 100%;\" data-internal-type=\"custom-container\">' +
    *                                     '<span style=\"float:left\" class=\"fa fa-book fa-3x\"></span>' +
    *                                     '<div data-internal-type=\"text-container\">' +
    *                                         '<div style=\"text-decoration: underline; font-weight: bold" data-internal-type=\"title\">{{itemTileCtrl.displayTitle}}</div>' +
    *                                         '<span data-internal-type=\"description\">{{itemTileCtrl.displayDescription}}</span>' +
    *                                         '<div ng-if=\"itemTileCtrl.showFirstProp\" data-internal-type=\"property\">' +
    *                                         '<span>{{itemTileCtrl.tileContent.myCustomData}}</span></div>' +
    *                                     '</div>' +
    *                                 '</div>';
    *
    *         vm.icvConfig = {
    *             icvData: [
    *                 {
    *                     title: 'Abacus',
    *                     author: 'Frank Herbert',
    *                     yearPublished: 1962,
    *                     subTitle: 'A guide to world domination.',
    *                     myCustomData : { like: true, soldout: false },
    *                     categories: [{Name:'Editor'}, {Name:'Buyer'}, {Name:'Publisher'}]
    *                 },
    *                 {
    *                     title: 'Dune',
    *                     author: 'Frank Herbert',
    *                     yearPublished: 1965,
    *                     subTitle: 'A spice addicts guide to world domination.',
    *                     myCustomData : { like: true, soldout: false },
    *                     categories: [{Name:'Editor'}]
    *                 },
    *                 {
    *                     title: 'Atlas',
    *                     author: 'Frank Herbert',
    *                     yearPublished: 1969,
    *                     subTitle: 'A world Tour.',
    *                     myCustomData : { like: true, soldout: true }
    *                 },
    *                 {
    *                     title: 'Guide to the Galaxy',
    *                     author: 'Douglas Adams',
    *                     yearPublished: 1979,
    *                     subTitle: 'How to get lost in space without really trying.',
    *                     myCustomData: { like: true, soldout: false }
    *                 },
    *                 {
    *                     title: 'Milky Galaxy',
    *                     author: 'Douglas Adams',
    *                     yearPublished: 1989,
    *                     subTitle: 'How to get lost in space.',
    *                     myCustomData: { like: false, soldout: true }
    *                 },
    *                 {
    *                     title: 'Galaxy Tours',
    *                     author: 'Douglas Adams',
    *                     yearPublished: 1983,
    *                     subTitle: 'How to travel the world.',
    *                     myCustomData: { like: true, soldout: false }
    *                 },
    *                 {
    *                     title: 'Abc',
    *                     author: 'Frank Herbert',
    *                     yearPublished: 1962,
    *                     subTitle: 'A guide to world domination.',
    *                     myCustomData: { like: false, soldout: true },
    *                     categories: [{Name:'Editor'}, {Name:'Buyer'}, {Name:'Publisher'}, {Name:'Seller'}, {Name:'Supplier'}, {Name:'Public Library'}]
    *                 },
    *                 {
    *                     title: 'DuneFrank',
    *                     author: 'Frank Herbert',
    *                     yearPublished: 1965,
    *                     subTitle: 'A spice addicts guide to world domination.',
    *                     myCustomData: { like: true, soldout: true }
    *                 },
    *                 {
    *                     title: 'AtlasGuideLink',
    *                     author: 'Frank Herbert',
    *                     yearPublished: 2005,
    *                     subTitle: 'A world Tour.',
    *                     myCustomData: { like: false, soldout: false }
    *                 },
    *                 {
    *                     title: 'Guide',
    *                     author: 'Douglas Adams',
    *                     yearPublished: 1979,
    *                     subTitle: 'How to get lost in space without really trying.',
    *                     myCustomData: { like: true, soldout: false }
    *                 },
    *                 {
    *                     title: 'MilkyGalaxy',
    *                     author: 'Douglas Adams',
    *                     yearPublished: 1989,
    *                     subTitle: 'How to get lost in space.',
    *                     myCustomData: { like: true, soldout: false }
    *                 },
    *                 {
    *                     title: 'GalaxyTours',
    *                     author: 'Douglas Adams',
    *                     yearPublished: 2001,
    *                     subTitle: 'How to travel the world.',
    *                     myCustomData: { like: false, soldout: false }
    *                 }
    *             ],
    *             icvOptions: {
    *                 containerID: 'myIcvContainer',
    *                 gridConfig: {
    *                   columnDefs: [{ 
    *                     field: 'title',
    *                     displayName: 'Title'
    *                   }, { 
    *                     field: 'author',
    *                     displayName: 'Author',
    *                     resizable: false
    *                   }, { 
    *                     field: 'subTitle',
    *                     displayName: 'Sub Title'
    *                   }, {
    *		               field: 'yearPublished',
    *		               displayName: 'Year',
    *		               displayIcon: 'common/icons/cmdInfo24.svg',
    *		               indicators: [{
    *		                  svgIcon: "common/icons/indicatorRedCircle16.svg",
    *                        tooltip: "Archived Books",
    *                        visible: function(row){
    *                           return (row.yearPublished < 2000);
    *                        }
    *                     }, {
    *		                  svgIcon: "common/icons/indicatorGreenCircle16.svg",
    *                        tooltip: "Active Books",
    *                        visible: function(row){
    *                           return (row.yearPublished > 2000);
    *                        }
    *		               }]
    *		            }],
    *                   showSelectionCheckbox: true,
    *                   showRowHighlight: true,
    *                   customRowClasses:{
    *                       even: 'myEvenRowClass',
    *                       odd: 'myOddRowClass',
    *                       selected: 'mySelectedRowClass'
    *                   }
    *                 },   
    *                 selectionMode: 'single',
    *                 uniqueID :'title',
    *                 tagField :'categories',
    *                 tileConfig: {
    *                     titleField:'title',
    *                     descriptionField: 'subTitle',
    *                     propertyFields: [
    *                         { field: 'yearPublished', displayName: 'Published' },
    *                         { field: 'myCustomData',displayName: 'CustomData' }]
    *                 },
    *                 useCustomColors: true,
    *                 bgColor: 'pink',
    *                 bgColorSelected: '#DBADA3',
    *                 color: 'blue',
    *                 colorSelected: '#EA3711',
    *                 enableResponsiveBehaviour: true,
    *                 viewMode: 's',
    *                 viewOptions: 'gsmlx',
    *                 noScroll: false,
    *                 rowHeight: 50,
    *                 height: 500,
    *                 filterBarOptions: 'sqgf',
    *                 filterFields: [
    *                     {
    *                         field: 'title',
    *                         displayName: 'Title',
    *                         type: 'string',
    *                         default: true
    *                     },
    *                     {
    *                         field: 'author',
    *                         displayName: 'Author',
    *                         type: 'string',
    *                         default: true
    *                     }
    *                 ],
    *                 enablePaging: true,
    *                 alwaysShowPager: false,
    *                 pagingOptions: {
    *                     pageSize: 10,
    *                     type: 'standard'
    *                 },
    *                 quickSearchOptions: {
    *                     enabled: true,
    *                     field: 'title',
    *                     filterText: '',
    *                     displayName: '',
    *                     placeholderText: ''
    *                 },
    *                 groupField: 'author',
    *                 groupFields: [
    *                     {
    *                         field: 'title',
    *                         displayName: 'Title'
    *                     },
    *                     {
    *                         field: 'author',
    *                         displayName: 'Author'
    *                     }
    *                 ],
    *                 onPageChangedCallback: function (page) {
    *                     console.log('pageChangedCallback: page: ' + page);
    *                 },
    *                 onSelectionChangeCallback: function (selectedItems, itemChanged) {
    *                     var selCount = selectedItems ? selectedItems.length : 0;
    *                     var uiSelectVal = itemChanged ? itemChanged.selected : 'none';
    *                     console.log('onSelectionChangeCallback: selCount: ' + selCount + ', uiSelectVal: ' + uiSelectVal);
    *                 },
    *                 sortInfo: {
    *                     field: 'author',
    *                     direction: 'asc',
    *                     fields: [
    *                         { field: 'title', displayName: 'Title' },
    *                         { field: 'author', displayName: 'Author' },
    *                         { field: 'yearPublished', displayName: 'Year' },
    *                     ]
    *                 },
    *                 onSortingChangedCallback: function (sortInfo) {
    *                     var message = 'sortingChangedCallback: sortInfo: ' + JSON.stringify(sortInfo);
    *                     console.log(message);
    *                 },
    *                 tagsManager: false,
    *                 tagsManagerOptions: {
    *                       entityName: '',
    *                       appName: ''
    *                 },
    *                 exportManager: false,
    *                 exportManagerOptions: {
    *                       entityName: '',
    *                       appName: ''
    *                 },
    *                 noDataMessage: "The ICV list is Empty",
    *                 image: 'fa-car',
    *                 gridContainerClass: 'grid-container',
    *                 tileContainerClass: 'tile-container',
    *                 smallTileTemplate: vm.customTemplate,
    *                 mediumTileTemplate: vm.customTemplate,
    *                 largeTileTemplate: vm.customTemplate,
    *             }
    *         }
    *     }]);
    * })();
    *
    * ```
    *
    *  <h2>sit-item-collection-viewer using server data</h2>
    *
    * In a view template, you can use the **sitItemCollectionViewer** with server-side configuration as follows:
    *  ```
    * <div>
    *      <sit-item-collection-viewer data-sit-options="icvCtrl.icvServerGridOptions"></sit-item-collection-viewer>
    * </div>
    * ```
    *
    * The following example shows how to configure a sit-item-collection-viewer widget with server data:
    *
    * In Controller:
    *
    *  ```
    *     vm.icvServerGridOptions = {
    *         // Other icv options
    *         serverDataOptions: {
    *             dataService: businessDataService,
    *             dataEntity: 'CommandDefinition',
    *             optionsString: '',
    *             appName: 'myApp'
    *         }
    *     }
    *  ```
    *  <h2>sit-item-collection-viewer configuration for Facets</h2>
    *
    * @example
    * In a view template, you can use the **sitItemCollectionViewer** with server-side configuration as follows:
    *  ```
    * <div>
    *      <sit-item-collection-viewer data-sit-options="icvCtrl.icvServerGridOptions"></sit-item-collection-viewer>
    * </div>
    * ```
    *
    * The following example shows how to configure a sit-item-collection-viewer widget with facets and server data:
    *
    * In Controller:
    *
    *  ```
    *     vm.icvServerGridOptions = {
    *         containerID: 'myIcvContainer',
    *         uniqueID :'title',
    *         gridConfig: {
    *             columnDefs: [
    *                 { field: 'title', displayName: 'Title' },
    *                 { field: 'author', displayName: 'Author', resizable: false },
    *                 { field: 'topRatedDistributor', displayName: 'Distributor', fieldSource: 'distributors'},
    *                 { field: 'yearPublished', displayName: 'Year' },
    *                 { field: 'totalAwards', displayName: 'Awards',  fieldSource: 'awards'},
    *                 { field: 'isPublished', displayName: 'Published', fieldSource: 'publishers', showCheckbox: true, dataType: 'boolean'}
    *         ]},
    *         selectionMode: 'single',
    *         enablePaging: false,
    *         tileConfig: {
    *             titleField:'title',
    *             descriptionField: 'topRatedDistributor',
    *             desctiptionFieldSource: 'distributors',
    *             propertyFields: [
    *                 { field: 'yearPublished', displayName: 'Published' },
    *                 { field: 'totalAwards', displayName: 'Awards',  fieldSource: 'awards'}],
    *             indicators: [{ 
    *                 svgIcon : 'common/icons/indicatorGreenSquare16.svg',
    *                 visible : function(tile){ return tile.isPublished === true },
    *                 tooltip : $translate.instant('isPublished')
    *             }]
    *         },
    *         filterBarOptions: 'sqgf',
    *         filterFields: [
    *             { field: 'title', displayName: 'Title', type: 'string',default: true },
    *             { field: 'author', displayName: 'Author', type: 'string', default: false}
    *             { field: 'isPublished', displayName: 'Published', type: 'boolean', fieldSource: 'publishers', default: false}
    *         ],
    *         quickSearchOptions: {
    *             enabled: true,
    *             field: 'topRatedDistributor',
    *             fieldSource: 'distributors',
    *             filterText: '',
    *             placeholderText: ''
    *         },
    *         groupField: 'author',
    *         groupFields: [
    *             { field: 'title', displayName: 'Title'},
    *             { field: 'author', displayName: 'Author'},
    *             { field: 'isPublished', displayName: 'Published', fieldSource: 'publishers'}
    *         ],
    *         onSelectionChangeCallback: function (selectedItems, itemChanged) {
    *              //code goes here
    *         },
    *         sortInfo: {
    *             field: 'author',
    *             direction: 'asc',
    *             fields: [
    *                 { field: 'title', displayName: 'Title' },
    *                 { field: 'author', displayName: 'Author' },
    *                 { field: 'yearPublished', displayName: 'Year' },
    *                 { field: 'totalAwards', displayName: 'Awards',  fieldSource: 'awards'}
    *             ]
    *         },
    *        serverDataOptions: {
    *             dataService: businessDataService,
    *             dataEntity: 'CommandDefinition',
    *             optionsString: '',
    *             appName: 'myApp',
    *             fieldSources: {
    *               publishers: {
    *                     name: 'myApp.MYPOMModel.DataModel.ReadingModel.FacetPublishers',
    *                     type: 'facet'
    *                    },
    *               distributors: {
    *                     name: 'myApp.MYPOMModel.DataModel.ReadingModel.FacetDistributors',
    *                     type: 'facet'
    *                     },
    *               awards: {
    *                     name: 'myApp.MYPOMModel.DataModel.ReadingModel.FacetAwards',
    *                     type: 'facet'
    *                     }
    *             }
    *         }
    *     }
    *  ```    *  
    *  NOTE:
    *      ICV Limitation - When we try to make a query in ICV for filtering the data using fields,
    *                       make sure field should not be an array type.
    *                       Otherwise ICV may not guarantee the proper filtering behavior and may end up with errors.
    *  
    * ````
    */
    //#endregion ng-doc comments
    ItemCollectionViewerController.$inject = ['$scope', '$rootScope', '$timeout', '$log', 'common.widgets.itemCollectionViewer.service',
        'common.widgets.pager.pageService', '$translate', '$element', 'common.widgets.globalDialog.service',
        '$document', 'common.services.personalization.personalizationService', 'common.widgets.messageOverlay.service', '$state',
        'siemens.simaticit.common.widgets.tagsManager.tagMgtProvider', 'common.services.tagsManager.tagsManagementService', 'common.services.security.securityService',
        'common.services.security.functionRightModel', 'siemens.simaticit.common.widgets.export.exportMgt', 'common.services.export.service',
        'common.widgets.itemCollectionViewer.preloadService', 'common.services.authentication', 'common.widgets.filterBar.service'];
    function ItemCollectionViewerController($scope, $rootScope, $timeout, $log, itemCollectionViewerService, uyPageService, $translate, $element, globalDialogService,
        $document, PersonalizationService, globalMsgOverlayManager, $state, tagMgtProvider, tagsManagementService, securityService, FunctionRightModel, exportProvider, exportService, preloadService, authenticationService) {
        var ctrl = this;
        var element = $element;
        var DOM_REFRENCES = {
            noDataDiv: '#noDataDiv',
            gridViewDiv: '#gridViewDiv',
            tileViewDiv: '#tileViewDiv'
        }
        var DOM_ELEMENTS = {
            element: $element,
            'itemCollectionViewerContainer': element.find('#itemCollectionViewerContainer'),
            'itemCollectionCanvas': element.find('#itemCollectionCanvas'),
            'noDataDiv': element.find(DOM_REFRENCES.noDataDiv),
            'gridViewDiv': element.find(DOM_REFRENCES.gridViewDiv),
            'tileViewDiv': element.find(DOM_REFRENCES.tileViewDiv)
        }
        var eventListners = [], logger, viewMode, compactMode, localPageOptions, viewOptions, filterBarSearchText, filterBarGroupField, filterBarGroupFieldSource, filterBarSortInfo, tileMode, tileTpl;
        var tagsColumnName, tagsField, segregationTagsActionButtons;
        var VALID_PAGE_SIZES = [10, 25, 50, 100];
        var DEFAULT_PAGE_SIZE = 10;
        var gridContainerHeightOnLoad, gridStyleHeightOnLoad, dataContainerHeightOnLoad, tileContainerHeightOnLoad, tileStyleHeightOnLoad;
        ctrl.isCompactQuickSearchEnabled = false;
        ctrl.isTagsMgtUserAuthorized = false;

        function activate() {
            init();
            initializeTags();
            initializeGridViewOptions();
            initializeViewBarOptions();
            updateFilterBarOptions();
            setOptionsAPIMethods();
            getUserPrefrences();
            initializeTileViewOptions();
            getTilePersonalizations();
            initialiseViewMode();
            getGridPersonalizations();
            initializeTagsManager();
            initializeExportManager();
        }

        activate();

        function init() {
            preloadService.getDefaultServices().forEach(function (item) {
                item.load(ctrl);
            });

            var preLoadServiceList = window.$UIF.Object.safeGet(ctrl, 'preLoadServices');
            if (preLoadServiceList !== null && preLoadServiceList.length > 0) {
                preLoadServiceList.forEach(function (item) {
                    if (preloadService.getService(item.name)) {
                        item.load(ctrl);
                    }
                });
            }

            initializeVariables();
            ctrl.setCollectionStyle = setCollectionStyle;
            ctrl.setHeight = setHeight;
            ctrl.checkResponsiveness = checkResponsiveness;
            ctrl.initializeHeight = initializeHeight;
            ctrl.sortingChangedCallback = sortingChangedCallback;
            ctrl.applyFilter = applyFilter;
            ctrl.resetFilter = resetFilter;
            ctrl.resetData = resetData;
            ctrl.viewBarTileDisplayOptions = [];
            if (ctrl.sitOptions.filterFields && ctrl.sitOptions.filterFields.type === 'filterPanel') {
                ctrl.sitOptions.filterFields.parentWidget = 'sit-item-collection-viewer';
                ctrl.sitOptions.filterFields.defaultApplyCallback = applyFilterCallback;
                ctrl.sitOptions.filterFields.onApplyIcvCallback = function () {
                    selectAll(false);
                };
            }
            setPageManager(true);
            if (!$scope.$id) {
                $scope.$id = window.$UIF.Utility.random();
            }
        }

        function initialiseViewMode() {
            if (ctrl.userPreferences && !compactMode) {
                if (ctrl.userPreferences.viewMode) {
                    var tileMode = (ctrl.userPreferences.viewMode === 't' || ctrl.userPreferences.viewMode === 'T');
                    ctrl.viewMode = (!compactMode && tileMode) ? 'tile' : 'grid';
                }
                else {
                    ctrl.viewMode = 'grid';
                }
            }
            if (ctrl.sitOptions.viewOptions) {
                ctrl.viewBarTileDisplayOptions = ['large', 'wide', 'medium']
            }
            if (!compactMode || ctrl.viewMode !== 'compact') {
                if (ctrl.viewMode === "tile") {
                    // If user has passed viewmode
                    if (['s', 'm', 'l'].indexOf(viewMode) !== -1) {
                        enableListMode();
                    } else {
                        // by default medium tile
                        tileModeVisibility(false, true, false);
                        tileModeSelection(false, true, false);
                        defaultTileVisibility('m', 'wide');
                    }
                    ctrl.viewBarOptions["grid"].selected = false;
                }
                else {
                    //If view mode is grid and tile should be there in the mode list.
                    var icvViewerOptions = ctrl.sitOptions.viewOptions;
                    if ((icvViewerOptions.indexOf("s") !== -1 || icvViewerOptions.indexOf("m") !== -1 || icvViewerOptions.indexOf("l") !== -1)) {
                        enableListMode();
                        tileModeSelection(false, false, false);
                    }
                    ctrl.viewBarOptions["grid"].selected = true;
                }
            }
            ctrl.defaultViewMode = ctrl.viewMode;
            ctrl.filterOptions.viewBarOptions = ctrl.viewBarOptions;
        }


        function enableListMode() {
            var propertyFieldsLength = ctrl.sitTileConfig.tileConfig.propertyFields.length;
            switch (propertyFieldsLength) {
                case 0:
                case 1:
                case 2:
                    tileModeVisibility(true, false, false);
                    tileModeSelection(true, false, false);
                    defaultTileVisibility('s', 'medium');
                    break;
                case 3:
                    tileModeVisibility(false, true, false);
                    tileModeSelection(false, true, false);
                    defaultTileVisibility('m', 'wide');
                    break;
                default:
                    if (ctrl.sitTileConfig.isCell) {
                        tileModeVisibility(false, true, false);
                        tileModeSelection(false, true, false);
                        defaultTileVisibility('m', 'wide');
                    }
                    else {
                        tileModeVisibility(false, false, true);
                        tileModeSelection(false, false, true);
                        defaultTileVisibility('l', 'large');
                    }
            }
        }


        function tileModeVisibility(small, medium, large) {
            ctrl.viewBarOptions["smallTile"].show = small;
            ctrl.viewBarOptions["mediumTile"].show = medium;
            ctrl.viewBarOptions["largeTile"].show = large;
        }

        function tileModeSelection(small, medium, large) {
            ctrl.viewBarOptions["smallTile"].selected = small
            ctrl.viewBarOptions["mediumTile"].selected = medium;
            ctrl.viewBarOptions["largeTile"].selected = large;
        }

        function defaultTileVisibility(tileViewMode, tileSize) {
            ctrl.tileViewOptions.tileViewMode = tileViewMode;
            ctrl.tileViewOptions.tileSize = tileSize;
        }


        function initializeTags() {
            var tagField = ctrl.sitOptions ? ctrl.sitOptions.tagField : null;
            if (tagField) {
                if (typeof tagField === 'string') {
                    tagsColumnName = tagsField = tagField;
                } else {
                    tagsField = tagField.field;
                    tagsColumnName = tagField.displayName ? tagField.displayName : tagsField;
                }
            }
        }

        function initializeTagsManager() {
            if (ctrl.gridOptions.tagsManager === undefined || ctrl.gridOptions.tagsManager === null) {
                ctrl.gridOptions.tagsManager = true;
            }
            if (ctrl.gridOptions.tagsManager && tagsManagementService.isDataSegregationEnabled()) {
                getIsEntitySegregable();
                if (authenticationService.isAuthorized()) {
                    ctrl.functionRightsItems = [];
                    var DSPOMModelCommands = 'Siemens.SimaticIT.DataSegregation.DataSegregation.DSPOMModel.Commands.Published.ReplaceSegregationTagAssociation';
                    var FR = new FunctionRightModel('business_command', DSPOMModelCommands, 'invoke');
                    ctrl.funRightListModel = [FR];
                    securityService.canPerformOp(ctrl.funRightListModel).then(function (data) {
                        if (data) {
                            if (data.length > 0) {
                                ctrl.isTagsMgtUserAuthorized = data[0].isAccessible;
                            }
                        }
                    }, function (resError) {
                        ctrl.isTagsMgtUserAuthorized = false;
                    });
                }

                var statename = $state.current.name;
                tagMgtProvider.addState($scope.$id, statename);
            }
        }

        function initializeExportManager() {
            if (ctrl.gridOptions.exportManager && ctrl.gridOptions.exportManagerOptions != null &&
                (ctrl.sitOptions && ctrl.sitOptions.selectionMode !== 'multi') || (ctrl.tileViewOptions && ctrl.tileViewOptions.multiSelect !== true)) {
                ctrl.gridOptions.exportManager = false;
            }
            if (ctrl.gridOptions.exportManager) {
                var statename = $state.current.name;
                var exportState = statename + '.Export';
                if ($state.href(exportState) === null || $state.href(exportState) === undefined) {
                    exportProvider.addState(statename);
                }
            }
        }

        function resetUserPrefrences(type) {
            if (!compactMode) {
                ctrl.userPreferences['viewMode'] = (ctrl.viewMode === 'grid') ? 'g' : 't';
            }
            if (type === "tile") {
                ctrl.userPreferences.propertyFields = [];
            } else {
                ctrl.userPreferences.columns = {};
            }
            PersonalizationService.setPersonalization('sitItemCollectionViewer', ctrl.sitOptions.userPrefId, ctrl.userPreferences).then(function () {
                if (type === undefined || type === 'tile') {
                    ctrl.tileViewOptions.titleField = ctrl.sitOptions.tileConfig.titleField;
                    ctrl.tileViewOptions.titleFieldDisplayName = window.$UIF.Object.safeGet(ctrl.sitOptions.tileConfig, 'titleField.displayName') || ctrl.sitOptions.tileConfig.titleField;
                    ctrl.tileViewOptions.titleFieldFilter = ctrl.sitOptions.tileConfig.titleFieldFilter;
                    ctrl.tileViewOptions.titleFieldSource = ctrl.sitOptions.tileConfig.titleFieldSource;
                    ctrl.tileViewOptions.descriptionField = ctrl.sitOptions.tileConfig.descriptionField;
                    ctrl.tileViewOptions.descriptionFieldDisplayName = window.$UIF.Object.safeGet(ctrl.sitOptions.tileConfig, 'descriptionField.displayName') || ctrl.sitOptions.tileConfig.descriptionField;
                    ctrl.tileViewOptions.descriptionFieldFilter = ctrl.sitOptions.tileConfig.descriptionFieldFilter;
                    ctrl.tileViewOptions.descriptionFieldSource = ctrl.sitOptions.tileConfig.descriptionFieldSource;
                    ctrl.tileViewOptions.propertyFields = $.extend(true, [], ctrl.sitOptions.tileConfig.propertyFields);
                    ctrl.sitTileConfig.userPreferences.titleField = ctrl.tileViewOptions.titleField;
                    ctrl.sitTileConfig.userPreferences.titleFieldDisplayName = ctrl.tileViewOptions.titleFieldDisplayName;
                    ctrl.sitTileConfig.userPreferences.titleFieldFilter = ctrl.tileViewOptions.titleFieldFilter;
                    ctrl.sitTileConfig.userPreferences.titleFieldSource = ctrl.tileViewOptions.titleFieldSource;
                    ctrl.sitTileConfig.userPreferences.descriptionField = ctrl.tileViewOptions.descriptionField;
                    ctrl.sitTileConfig.userPreferences.descriptionFieldDisplayName = ctrl.tileViewOptions.descriptionFieldDisplayName;
                    ctrl.sitTileConfig.userPreferences.descriptionFieldFilter = ctrl.tileViewOptions.descriptionFieldFilter;
                    ctrl.sitTileConfig.userPreferences.descriptionFieldSource = ctrl.tileViewOptions.descriptionFieldSource;
                    ctrl.sitTileConfig.userPreferences.propertyFields = $.extend(true, [], ctrl.tileViewOptions.propertyFields);
                    if (ctrl.tileViewOptions.dataUpdated) {
                        ctrl.tileViewOptions.dataUpdated();
                    }
                    ctrl.gridOptions.columnDefs = $.extend(true, [], ctrl.sitConfig.columnDefs.sort(function (a, b) { return a.index - b.index }));
                }
                if (type === undefined || type === 'grid') {
                    ctrl.gridOptions.columnDefs = $.extend(true, [], ctrl.sitOptions.gridConfig.columnDefs);
                    if (ctrl.gridOptions.evaluateExpressionColumns) {
                        ctrl.gridOptions.evaluateExpressionColumns();
                    }
                    updateGridSortOptions();
                    angular.forEach(ctrl.gridOptions.columnDefs, function (columnDef) {
                        columnDef.visible = typeof columnDef.visible === 'boolean' ? columnDef.visible : true;
                    });
                    if (ctrl.gridOptions.tagField) {
                        ctrl.gridOptions.columnDefs.push({
                            field: tagsField,
                            displayName: tagsColumnName,
                            sortable: false,
                            cellTemplate: "<div  id='data-cell-container' class='ngCellText' ng-class='col.colIndex()'>" +
                                "<sit-tag-list ng-show='row[\"entity\"][\"" + tagsField + "\"].length > 0' sit-data='row[\"entity\"][\"" + tagsField + "\"]'></sit-tag-list></div>"
                        });
                    }
                    if (ctrl.sitConfig.columnDefs.length > ctrl.gridOptions.columnDefs.length) {

                        var definedColumn = [];

                        for (var i = 0; i < ctrl.sitConfig.columnDefs.length; i++) {
                            if (ctrl.sitConfig.columnDefs[i].isImageCol) {
                                definedColumn[i] = ctrl.sitConfig.columnDefs[i];
                                ctrl.gridOptions.columnDefs = $.merge(definedColumn, ctrl.gridOptions.columnDefs);
                                break;
                            }
                        }
                    }
                    ctrl.sitConfig.columnDefs = $.extend(true, [], ctrl.gridOptions.columnDefs.sort(function (a, b) { return a.index - b.index }));
                    var userTileSettings = ctrl.sitTileConfig.getTileSettings();
                    ctrl.tileViewOptions.titleField = userTileSettings.titleField;
                    ctrl.tileViewOptions.titleFieldDisplayName = userTileSettings.titleFieldDisplayName;
                    ctrl.tileViewOptions.titleFieldSource = userTileSettings.titleFieldSource;
                    ctrl.tileViewOptions.titleFieldFilter = userTileSettings.titleFieldFilter;
                    ctrl.tileViewOptions.descriptionField = userTileSettings.descriptionField;
                    ctrl.tileViewOptions.descriptionFieldDisplayName = userTileSettings.descriptionFieldDisplayName;
                    ctrl.tileViewOptions.descriptionFieldSource = userTileSettings.descriptionFieldSource;
                    ctrl.tileViewOptions.descriptionFieldFilter = userTileSettings.descriptionFieldFilter;
                    ctrl.tileViewOptions.propertyFields = $.extend(true, [], userTileSettings.propertyFields);
                    ctrl.sitTileConfig.userPreferences = userTileSettings;
                    if (ctrl.tileViewOptions.dataUpdated) {
                        ctrl.tileViewOptions.dataUpdated();
                    }
                }

                if (!compactMode) {
                    (ctrl.viewMode === 'tile') ? changeViewMode('tile', ctrl.sitTileConfig.viewMode) : changeViewMode('grid');
                }
            });
        }

        function getGridTileButtons() {
            return [
                {
                    id: "SAVE ALL",
                    displayName: $translate.instant('common.ok'),
                    onClickCallback: function () {
                        var viewButtonSize = "Small";
                        if (ctrl.selectedViewMode) {
                            ctrl.viewMode = ctrl.selectedViewMode;
                            ctrl.defaultViewMode = ctrl.selectedViewMode;
                        }

                        if (ctrl.viewMode) {
                            if (ctrl.viewMode === 'tile') {
                                if (_.indexOf(ctrl.viewBarTileDisplayOptions, "wide") !== -1) {
                                    viewButtonSize = "Medium";
                                } else if (_.indexOf(ctrl.viewBarTileDisplayOptions, "large") !== -1) {
                                    viewButtonSize = "Large";
                                }
                                $rootScope.$broadcast('sit-item-collection-viewer.change-view-mode-completed.' + ctrl.sitOptions.containerID, { view: viewButtonSize });
                            }
                            else {
                                $rootScope.$broadcast('sit-item-collection-viewer.change-view-mode-completed.' + ctrl.sitOptions.containerID, { view: "Grid" });
                            }
                        }
                        setUserPrefrences(ctrl.viewMode);
                        globalDialogService.hide();
                        var userTileSettings = ctrl.sitTileConfig.getTileSettings();
                        ctrl.tileViewOptions.titleField = userTileSettings.titleField;
                        ctrl.tileViewOptions.titleFieldDisplayName = userTileSettings.titleFieldDisplayName;
                        ctrl.tileViewOptions.titleFieldSource = userTileSettings.titleFieldSource;
                        ctrl.tileViewOptions.titleFieldFilter = userTileSettings.titleFieldFilter;
                        ctrl.tileViewOptions.descriptionField = userTileSettings.descriptionField;
                        ctrl.tileViewOptions.descriptionFieldDisplayName = userTileSettings.descriptionFieldDisplayName;
                        ctrl.tileViewOptions.descriptionFieldSource = userTileSettings.descriptionFieldSource;
                        ctrl.tileViewOptions.descriptionFieldFilter = userTileSettings.descriptionFieldFilter;
                        ctrl.tileViewOptions.propertyFields = $.extend(true, [], userTileSettings.propertyFields);
                        ctrl.sitTileConfig.userPreferences = userTileSettings;
                        if (ctrl.viewMode === 'tile' && ctrl.tileViewOptions.dataUpdated) {
                            ctrl.tileViewOptions.dataUpdated();
                        }
                        if (ctrl.sitConfig.columnDefs.length === 0) {
                            ctrl.sitConfig.columnDefs = $.extend(true, [], ctrl.gridOptions.columnDefs.sort(function (a, b) { return a.index - b.index }));
                        }
                        else {
                            ctrl.gridOptions.columnDefs = $.extend(true, [], ctrl.sitConfig.columnDefs.sort(function (a, b) { return a.index - b.index }));
                        }
                    }
                },
                {
                    id: "cancelButton",
                    displayName: $translate.instant('common.cancel'),
                    onClickCallback: function () {
                        globalDialogService.hide();
                        ctrl.selectedViewMode = null;
                        ctrl.sitTileConfig.userPreferences.titleField = ctrl.tileViewOptions.titleField;
                        ctrl.sitTileConfig.userPreferences.titleFieldDisplayName = ctrl.tileViewOptions.titleFieldDisplayName;
                        ctrl.sitTileConfig.userPreferences.titleFieldSource = ctrl.tileViewOptions.titleFieldSource;
                        ctrl.sitTileConfig.userPreferences.titleFieldFilter = ctrl.tileViewOptions.titleFieldFilter;
                        ctrl.sitTileConfig.userPreferences.descriptionField = ctrl.tileViewOptions.descriptionField;
                        ctrl.sitTileConfig.userPreferences.descriptionFieldDisplayName = ctrl.tileViewOptions.descriptionFieldDisplayName;
                        ctrl.sitTileConfig.userPreferences.descriptionFieldSource = ctrl.tileViewOptions.descriptionFieldSource;
                        ctrl.sitTileConfig.userPreferences.descriptionFieldFilter = ctrl.tileViewOptions.descriptionFieldFilter;
                        ctrl.sitTileConfig.userPreferences.propertyFields = $.extend(true, [], ctrl.tileViewOptions.propertyFields);
                        angular.forEach(ctrl.gridOptions.columnDefs, function (columnDef) {
                            columnDef.visible = typeof columnDef.visible === 'boolean' ? columnDef.visible : true;
                        });
                        ctrl.sitConfig.columnDefs = $.extend(true, [], ctrl.gridOptions.columnDefs);
                    }
                }
            ];
        }

        function getTilePersonalizations() {
            ctrl.tileModalId = $scope.$id + 'Tile' + ctrl.sitOptions.userPrefId;
            ctrl.TileDialogTitle = $translate.instant('userPrefrences.title.tile');
            ctrl.sitTileConfig = {
                tileConfig: {},
                userPreferences: {}
            };

            ctrl.sitTileConfig.tileConfig.titleField = ctrl.sitOptions.tileConfig.titleField;
            ctrl.sitTileConfig.tileConfig.titleFieldFilter = ctrl.sitOptions.tileConfig.titleFieldFilter;
            ctrl.sitTileConfig.tileConfig.titleFieldSource = ctrl.sitOptions.tileConfig.titleFieldSource;
            ctrl.sitTileConfig.tileConfig.descriptionField = ctrl.sitOptions.tileConfig.descriptionField;
            ctrl.sitTileConfig.tileConfig.descriptionFieldFilter = ctrl.sitOptions.tileConfig.descriptionFieldFilter;
            ctrl.sitTileConfig.tileConfig.descriptionFieldSource = ctrl.sitOptions.tileConfig.descriptionFieldSource;
            ctrl.sitTileConfig.tileConfig.propertyFields = $.extend(true, [], ctrl.sitOptions.tileConfig.propertyFields);
            ctrl.sitTileConfig.userPreferences.propertyFields = $.extend(true, [], ctrl.tileOptions.propertyFields);
            ctrl.sitTileConfig.userPreferences.titleField = ctrl.tileOptions.titleField;
            ctrl.sitTileConfig.userPreferences.titleFieldDisplayName = ctrl.tileOptions.titleFieldDisplayName;
            ctrl.sitTileConfig.userPreferences.titleFieldFilter = ctrl.tileOptions.titleFieldFilter;
            ctrl.sitTileConfig.userPreferences.titleFieldSource = ctrl.tileOptions.titleFieldSource;
            ctrl.sitTileConfig.userPreferences.descriptionField = ctrl.tileOptions.descriptionField;
            ctrl.sitTileConfig.userPreferences.descriptionFieldDisplayName = ctrl.tileOptions.descriptionFieldDisplayName;
            ctrl.sitTileConfig.userPreferences.descriptionFieldFilter = ctrl.tileOptions.descriptionFieldFilter;
            ctrl.sitTileConfig.userPreferences.descriptionFieldSource = ctrl.tileOptions.descriptionFieldSource;
            ctrl.sitTileConfig.viewMode = ctrl.tileViewOptions.tileViewMode;
            ctrl.sitTileConfig.tileTemplate = ctrl.tileViewOptions.tileTemplate;
            ctrl.sitTileConfig.isCell = ctrl.sitOptions.tileConfig.isCell;

            ctrl.buttonsTileList = [
                {
                    id: "SAVE ALL",
                    displayName: $translate.instant('common.ok'),
                    onClickCallback: function () {
                        globalDialogService.hide();
                        setUserPrefrences('tile');
                        var userTileSettings = ctrl.sitTileConfig.getTileSettings();
                        ctrl.tileViewOptions.titleField = userTileSettings.titleField;
                        ctrl.tileViewOptions.titleFieldDisplayName = userTileSettings.titleFieldDisplayName;
                        ctrl.tileViewOptions.titleFieldSource = userTileSettings.titleFieldSource;
                        ctrl.tileViewOptions.titleFieldFilter = userTileSettings.titleFieldFilter;
                        ctrl.tileViewOptions.descriptionField = userTileSettings.descriptionField;
                        ctrl.tileViewOptions.descriptionFieldDisplayName = userTileSettings.descriptionFieldDisplayName;
                        ctrl.tileViewOptions.descriptionFieldSource = userTileSettings.descriptionFieldSource;
                        ctrl.tileViewOptions.descriptionFieldFilter = userTileSettings.descriptionFieldFilter;
                        ctrl.tileViewOptions.propertyFields = $.extend(true, [], userTileSettings.propertyFields);
                        ctrl.sitTileConfig.userPreferences = userTileSettings;
                        ctrl.tileViewOptions.dataUpdated();
                    }
                },
                {
                    id: "RESET",
                    onClickCallback: function () {
                        if (ctrl.sitOptions && ctrl.sitOptions.viewOptions.toLowerCase() !== '') {
                            showOverlay();
                        } else {
                            resetUserPrefrences('tile');
                            globalDialogService.hide();
                        }
                    }
                },
                {
                    id: "cancelButton",
                    displayName: $translate.instant('common.cancel'),
                    onClickCallback: function () {
                        ctrl.selectedViewMode = null;
                        ctrl.defaultViewMode = null;
                        globalDialogService.hide();
                        ctrl.sitTileConfig.userPreferences.titleField = ctrl.tileViewOptions.titleField;
                        ctrl.sitTileConfig.userPreferences.titleFieldDisplayName = ctrl.tileViewOptions.titleFieldDisplayName;
                        ctrl.sitTileConfig.userPreferences.titleFieldSource = ctrl.tileViewOptions.titleFieldSource;
                        ctrl.sitTileConfig.userPreferences.titleFieldFilter = ctrl.tileViewOptions.titleFieldFilter;
                        ctrl.sitTileConfig.userPreferences.descriptionField = ctrl.tileViewOptions.descriptionField;
                        ctrl.sitTileConfig.userPreferences.descriptionFieldDisplayName = ctrl.tileViewOptions.descriptionFieldDisplayName;
                        ctrl.sitTileConfig.userPreferences.descriptionFieldSource = ctrl.tileViewOptions.descriptionFieldSource;
                        ctrl.sitTileConfig.userPreferences.descriptionFieldFilter = ctrl.tileViewOptions.descriptionFieldFilter;
                        ctrl.sitTileConfig.userPreferences.propertyFields = $.extend(true, [], ctrl.tileViewOptions.propertyFields);

                    }
                }

            ];
        }

        function getGridPersonalizations() {
            ctrl.modalid = $scope.$id + 'grid' + ctrl.sitOptions.userPrefId;
            ctrl.GridDialogTitle = $translate.instant('userPrefrences.title.grid');
            ctrl.sitConfig = {};
            ctrl.gridOptions.columnDefs = $.extend(true, [], ctrl.gridColumnDefs);
            ctrl.sitConfig.columnDefs = $.extend(true, [], ctrl.gridColumnDefs);
            ctrl.dialogcentered = true;
            ctrl.buttonsGridList = [
                {
                    id: "SAVE ALL",
                    displayName: $translate.instant('common.ok'),
                    onClickCallback: function () {
                        globalDialogService.hide();
                        setUserPrefrences('grid');
                        ctrl.gridOptions.columnDefs = $.extend(true, [], ctrl.sitConfig.columnDefs.sort(function (a, b) { return a.index - b.index }));
                    }
                },
                {
                    id: "RESET",
                    onClickCallback: function () {
                        if (ctrl.sitOptions && ctrl.sitOptions.viewOptions.toLowerCase() !== '') {
                            showOverlay();
                        } else {
                            resetUserPrefrences('grid');
                            globalDialogService.hide();
                        }
                    }
                },
                {
                    id: "cancelButton",
                    displayName: $translate.instant('common.cancel'),
                    onClickCallback: function () {
                        ctrl.selectedViewMode = null;
                        ctrl.defaultViewMode = null;
                        globalDialogService.hide();
                        angular.forEach(ctrl.gridOptions.columnDefs, function (columnDef) {
                            columnDef.visible = typeof columnDef.visible === 'boolean' ? columnDef.visible : true;
                        });
                        ctrl.sitConfig.columnDefs = $.extend(true, [], ctrl.gridOptions.columnDefs);
                    }
                }
            ];


        }
        function getUserPrefrences() {
            ctrl.userPreferences = PersonalizationService.getCurrentUserPreference('sitItemCollectionViewer', ctrl.sitOptions.userPrefId);
            var userPreferenceCols = [];
            if (ctrl.userPreferences) {
                if (ctrl.gridColumnDefs.length === 0) {
                    ctrl.gridColumnDefs = ctrl.userPreferences.columns;
                }
                for (var column in ctrl.userPreferences.columns) {
                    if (column !== 'undefined') {
                        var gridColumn = _.findWhere(ctrl.gridColumnDefs, { field: column });
                        if (gridColumn) {
                            gridColumn.visible = ctrl.userPreferences.columns[column].visible;
                            gridColumn.index = ctrl.userPreferences.columns[column].index;
                            userPreferenceCols.push(gridColumn);
                        }
                    }
                }
                userPreferenceCols.sort(function (col1, col2) {
                    return col1.index - col2.index;
                });
                ctrl.gridColumnDefs = $.extend(true, [], userPreferenceCols);
                ctrl.tileOptions = {};
                ctrl.tileOptions.titleField = ctrl.userPreferences.titleField ? ctrl.userPreferences.titleField : '';
                ctrl.tileOptions.titleFieldDisplayName = ctrl.userPreferences.titleFieldDisplayName ? ctrl.userPreferences.titleFieldDisplayName : '';
                ctrl.tileOptions.titleFieldSource = window.$UIF.Object.safeGet(ctrl, 'userPreferences.titleFieldSource');
                ctrl.tileOptions.titleFieldFilter = ctrl.userPreferences.titleFieldFilter;
                ctrl.tileOptions.descriptionField = ctrl.userPreferences.descriptionField ? ctrl.userPreferences.descriptionField : '';
                ctrl.tileOptions.descriptionFieldDisplayName = ctrl.userPreferences.descriptionFieldDisplayName ? ctrl.userPreferences.descriptionFieldDisplayName : '';
                ctrl.tileOptions.descriptionFieldSource = window.$UIF.Object.safeGet(ctrl, 'userPreferences.descriptionFieldSource');
                ctrl.tileOptions.descriptionFieldFilter = ctrl.userPreferences.descriptionFieldFilter;
                ctrl.tileOptions.propertyFields = ctrl.userPreferences.propertyFields && ctrl.userPreferences.propertyFields.length !== 0 ?
                    $.extend(true, [], ctrl.userPreferences.propertyFields) : [];
            }
        }
        function setUserPrefrences(mode) {
            ctrl.userPreferences = PersonalizationService.getCurrentUserPreference('sitItemCollectionViewer', ctrl.sitOptions.userPrefId);
            if (ctrl.userPreferences === null) {
                ctrl.userPreferences = {
                    columns: {}
                };
            }
            if (ctrl.userPreferences) {
                if (mode === "grid" || mode === "tile") {
                    if (ctrl.sitTileConfig && ctrl.sitTileConfig.getTileSettings && typeof ctrl.sitTileConfig.getTileSettings === 'function') {
                        ctrl.userPreferences = ctrl.sitTileConfig.getTileSettings();
                    }
                    ctrl.userPreferences.columns = {};
                    angular.forEach(ctrl.sitConfig.columnDefs, function (column) {
                        ctrl.userPreferences.columns[column.field] = {
                            "visible": column.visible,
                            "index": column.index
                        };
                    });
                }
                if (!compactMode) {
                    ctrl.userPreferences['viewMode'] = (ctrl.viewMode === 'grid') ? 'g' : 't';
                }
                PersonalizationService.setPersonalization('sitItemCollectionViewer', ctrl.sitOptions.userPrefId, ctrl.userPreferences);
            }
        }

        function initializeVariables() {
            itemCollectionViewerService.setConfigurationDefaults(ctrl.sitOptions);
            logger = new LogWrapper($log, ctrl.sitOptions ? ctrl.sitOptions.debug : false, 'ItemCollectionViewer.controller');
            ctrl.resetView = true;
            //hiding no data message on load and handle it when change in sitData (i.e, in resetData).
            ctrl.noData = true;
            ctrl.noDataMessage = ctrl.sitOptions ? ctrl.sitOptions.noDataMessage ? ctrl.sitOptions.noDataMessage : $translate.instant('common.no-data') : '';
            ctrl.showFilter = false;
            ctrl.hideIntialFilterPanel = true;
            ctrl.sitFilterOptions = ctrl.sitOptions && ctrl.sitOptions.filterOptions ? ctrl.sitOptions.filterOptions : {};
            viewMode = ctrl.sitOptions ? ctrl.sitOptions.viewMode.toLowerCase() : '';
            // check for compact mode and fix width if necessary so it works well with medium item tile.
            ctrl.gridMode = viewMode === 'g';
            compactMode = viewMode === 'c';
            ctrl.sitOptions.enablePaging = ctrl.sitOptions && compactMode ? false : ctrl.sitOptions.enablePaging;
            ctrl.compactStyle = compactMode ? { width: '269px' } : '';
            ctrl.handleResize = true;
            ctrl.collectionStyle = {};

            if (window.$UIF.Object.safeGet(ctrl.sitOptions, 'pagingOptions.pageSize') !== null) {
                ctrl.sitOptions.pagingOptions.pageSize = VALID_PAGE_SIZES.indexOf(ctrl.sitOptions.pagingOptions.pageSize) != -1 ? ctrl.sitOptions.pagingOptions.pageSize : DEFAULT_PAGE_SIZE;
            }

            // local copy of paging options to pass to the grid/tileView
            // don't want either corrupting the original
            localPageOptions = $.extend(true, {}, ctrl.sitOptions ? ctrl.sitOptions.pagingOptions : {});
            localPageOptions.initialPageSize = localPageOptions.pageSize;
            ctrl.userCustomizedJson = {
                columns: {}
            };
            ctrl.TagsManagerVisibility = false;
            ctrl.ExportManagerVisibility = false;
            ctrl.IsEntitySegregable = false;
        }

        function showOverlay(type) {
            var overlay = {
                text: '',
                title: '',
                buttons: [
                    {
                        id: 'cancelButton',
                        displayName: $translate.instant('common.cancel'),
                        onClickCallback: function () {
                            globalMsgOverlayManager.hide();
                        }
                    },
                    {
                        id: 'okButton',
                        displayName: $translate.instant('common.ok'),
                        onClickCallback: function () {
                            globalMsgOverlayManager.hide();
                            globalDialogService.hide();
                            resetUserPrefrences(type);
                        }
                    }]
            };
            overlay.title = $translate.instant('userPrefrences.overlayMessage.title');
            overlay.text = $translate.instant('userPrefrences.overlayMessage.text');
            globalMsgOverlayManager.set(overlay);
            globalMsgOverlayManager.show();
        }

        function getDisplayName(mode) {
            var displayName = '';
            if (ctrl.tileOptions && ctrl.tileOptions[mode + 'FieldDisplayName']) {
                displayName = ctrl.tileOptions[mode + 'FieldDisplayName'];
            } else if (ctrl.sitOptions) {
                displayName = window.$UIF.Object.safeGet(ctrl.sitOptions.tileConfig, mode + 'Field.displayName') ||
                    ctrl.sitOptions.tileConfig[mode + 'Field.displayName'] || '';
            }
            return displayName;
        }

        function initializeTileViewOptions() {

            setTileModeTpl();

            ctrl.tileViewOptions = {
                noData: true,
                alwaysShowPager: ctrl.sitOptions && compactMode ? false : ctrl.sitOptions.alwaysShowPager,
                bgColor: ctrl.sitOptions ? ctrl.sitOptions.bgColor : '',
                bgColorSelected: ctrl.sitOptions ? ctrl.sitOptions.bgColorSelected : '',
                color: ctrl.sitOptions ? ctrl.sitOptions.color : '',
                colorSelected: ctrl.sitOptions ? ctrl.sitOptions.colorSelected : '',
                containerID: 'tileViewDiv',
                descriptionField: ctrl.tileOptions && ctrl.tileOptions.descriptionField
                    ? ctrl.tileOptions.descriptionField
                    : ctrl.sitOptions ? ctrl.sitOptions.tileConfig.descriptionField : '',
                descriptionFieldDisplayName: getDisplayName('description'),
                descriptionFieldFilter: ctrl.tileOptions && ctrl.tileOptions.descriptionFieldFilter
                    ? ctrl.tileOptions.descriptionFieldFilter
                    : (ctrl.sitOptions.tileConfig.descriptionFieldFilter || null),
                descriptionFieldSource: window.$UIF.Object.safeGet(ctrl, 'tileOptions.descriptionFieldSource') ||
                    window.$UIF.Object.safeGet(ctrl, 'sitOptions.tileConfig.descriptionFieldSource') || '',
                noDataMessage: ctrl.sitOptions ? ctrl.sitOptions.noDataMessage : '',
                enablePaging: ctrl.sitOptions && compactMode ? false : ctrl.sitOptions.enablePaging,
                tagsManager: !ctrl.sitOptions.tagsManager ? ctrl.sitOptions.tagsManager : true,
                tagsManagerOptions: !ctrl.sitOptions.tagsManagerOptions ? ctrl.sitOptions.tagsManagerOptions : { entityName: '', appName: '' },
                exportManager: !ctrl.sitOptions.exportManager ? ctrl.sitOptions.exportManager : true,
                exportManagerOptions: !ctrl.sitOptions.exportManagerOptions ? ctrl.sitOptions.exportManagerOptions : { entityName: '', appName: '' },
                serverDataOptions: !ctrl.sitOptions.serverDataOptions ? ctrl.sitOptions.serverDataOptions : { dataEntity: '', appName: '' },
                groupBy: ctrl.sitOptions ? ctrl.sitOptions.groupField : '',
                groupByFieldSource: window.$UIF.Object.safeGet(ctrl, 'sitOptions.groupFieldSource'),
                handleResize: ctrl.handleResize, // force tile-view to handle resizing even though a specific height is set.
                image: ctrl.sitOptions.image ? ctrl.sitOptions.image : ctrl.sitOptions.tileConfig.image,
                svgIcon: ctrl.sitOptions.svgIcon ? ctrl.sitOptions.svgIcon : '',
                typeIcon: ctrl.sitOptions.typeIcon ? ctrl.sitOptions.typeIcon : '',
                multiSelect: ctrl.sitOptions && ctrl.sitOptions.selectionMode ? ctrl.sitOptions.selectionMode === 'multi' : false,
                selectionMode: ctrl.sitOptions.selectionMode ? ctrl.sitOptions.selectionMode : 'single',
                pageManager: ctrl.pageManager,
                pagingOptions: localPageOptions,
                propertyFields: ctrl.tileOptions && ctrl.tileOptions.propertyFields && ctrl.tileOptions.propertyFields.length !== 0 ?
                    $.extend(true, [], ctrl.tileOptions.propertyFields) : ctrl.sitOptions.tileConfig.propertyFields ?
                        $.extend(true, [], ctrl.sitOptions.tileConfig.propertyFields) : [],
                quickSearchOptions: ctrl.sitOptions.quickSearchOptions ? ctrl.sitOptions.quickSearchOptions : {},
                quickSearchType: ctrl.sitOptions && ctrl.sitOptions.quickSearchType ? ctrl.sitOptions.quickSearchType : '',
                onPageChangedCallback: ctrl.sitOptions ? ctrl.sitOptions.onPageChangedCallback : null,
                onSelectionChangeCallback: ctrl.sitOptions ? ctrl.sitOptions.onSelectionChangeCallback : null,
                onSortingChangedCallback: ctrl.sitOptions ? ctrl.sitOptions.onSortingChangedCallback : null,
                selectStyle: ctrl.sitOptions && compactMode ? 'alternate' : ctrl.sitOptions.selectStyle,
                sortInfo: ctrl.sitOptions.sortInfo ? ctrl.sitOptions.sortInfo : {},
                tileSize: tileMode,
                tileType: 'item', //hardcoded. do not let user specify
                titleField: ctrl.tileOptions && ctrl.tileOptions.titleField ? ctrl.tileOptions.titleField : ctrl.sitOptions.tileConfig.titleField ?
                    ctrl.sitOptions.tileConfig.titleField : '',
                titleFieldDisplayName: getDisplayName('title'),
                titleFieldFilter: ctrl.tileOptions && ctrl.tileOptions.titleFieldFilter
                    ? ctrl.tileOptions.titleFieldFilter
                    : (ctrl.sitOptions.tileConfig.titleFieldFilter || null),
                titleFieldSource: window.$UIF.Object.safeGet(ctrl, 'tileOptions.titleFieldSource') || window.$UIF.Object.safeGet(ctrl, 'sitOptions.tileConfig.titleFieldSource') || '',
                uniqueID: ctrl.sitOptions.uniqueID ? ctrl.sitOptions.uniqueID : '',
                useCustomColors: ctrl.sitOptions.useCustomColors ? ctrl.sitOptions.useCustomColors : false,
                viewHeight: ctrl.collectionHeight,
                debug: ctrl.sitOptions.debug ? ctrl.sitOptions.debug : false,
                tagField: tagsField,
                tileTemplate: tileTpl,
                enableResponsiveBehaviour: ctrl.sitOptions.enableResponsiveBehaviour ? ctrl.sitOptions.enableResponsiveBehaviour : false,
                tileViewMode: viewMode,
                noScroll: ctrl.sitOptions.noScroll ? ctrl.sitOptions.noScroll : false,
                tileContainerClass: ctrl.sitOptions.tileContainerClass ? ctrl.sitOptions.tileContainerClass : '',
                isCompactMode: ctrl.sitOptions && compactMode,
                commands: ctrl.sitOptions.tileConfig.commands,
                indicators: ctrl.sitOptions.tileConfig.indicators,
                isCell: ctrl.sitOptions.tileConfig.isCell ? ctrl.sitOptions.tileConfig.isCell : false
            };
            if (!ctrl.tileOptions) {
                ctrl.tileOptions = {};
            }
            ctrl.tileOptions.titleField = window.$UIF.Object.safeGet(ctrl.tileOptions, 'titleField.field') ||
                window.$UIF.Object.safeGet(ctrl.tileViewOptions, 'titleField.field') ||
                ctrl.tileOptions.titleField || ctrl.tileViewOptions.titleField || '';
            ctrl.tileOptions.titleFieldDisplayName = window.$UIF.Object.safeGet(ctrl.tileOptions, 'titleFieldDisplayName') ||
                window.$UIF.Object.safeGet(ctrl.tileViewOptions, 'titleFieldDisplayName') ||
                ctrl.tileOptions.titleField || ctrl.tileViewOptions.titleField || '';
            ctrl.tileOptions.titleFieldFilter = ctrl.tileOptions.titleFieldFilter || ctrl.tileViewOptions.titleFieldFilter || null;
            ctrl.tileOptions.titleFieldSource = window.$UIF.Object.safeGet(ctrl.tileOptions, 'titleFieldSource') ||
                window.$UIF.Object.safeGet(ctrl.tileViewOptions, 'titleFieldSource') || '';
            ctrl.tileOptions.descriptionField = window.$UIF.Object.safeGet(ctrl.tileOptions, 'descriptionField.field') ||
                window.$UIF.Object.safeGet(ctrl.tileViewOptions, 'descriptionField.field') ||
                ctrl.tileOptions.descriptionField || ctrl.tileViewOptions.descriptionField || '';
            ctrl.tileOptions.descriptionFieldDisplayName = window.$UIF.Object.safeGet(ctrl.tileOptions, 'descriptionFieldDisplayName') ||
                window.$UIF.Object.safeGet(ctrl.tileViewOptions, 'descriptionFieldDisplayName') ||
                ctrl.tileOptions.descriptionField || ctrl.tileViewOptions.descriptionField || '';
            ctrl.tileOptions.descriptionFieldFilter = ctrl.tileOptions.descriptionFieldFilter || ctrl.tileViewOptions.descriptionFieldFilter || null;
            ctrl.tileOptions.descriptionFieldSource = window.$UIF.Object.safeGet(ctrl.tileOptions, 'descriptionFieldSource') ||
                window.$UIF.Object.safeGet(ctrl.tileViewOptions, 'descriptionFieldSource') || '';
            ctrl.tileOptions.propertyFields = ctrl.tileOptions && ctrl.tileOptions.propertyFields && ctrl.tileOptions.propertyFields.length !== 0 ?
                $.extend(true, [], ctrl.tileOptions.propertyFields) : $.extend(true, [], ctrl.tileViewOptions.propertyFields);
        }

        function setTileModeTpl() {
            if (compactMode || viewMode === 's') {
                tileMode = 'medium';
                tileTpl = ctrl.sitOptions ? ctrl.sitOptions.smallTileTemplate : '';
            } else if (viewMode === 'l') {
                tileMode = 'large';
                tileTpl = ctrl.sitOptions ? ctrl.sitOptions.largeTileTemplate : '';
            } else {
                tileMode = 'wide';
                tileTpl = ctrl.sitOptions ? ctrl.sitOptions.mediumTileTemplate : '';
            }

        }

        function initializeGridViewOptions() {
            // grid view options
            ctrl.gridOptions = $.extend(true, {}, ctrl.sitOptions ? ctrl.sitOptions.gridConfig : {});
            ctrl.gridOptions.userPrefId = ctrl.sitOptions.userPrefId;
            ctrl.gridOptions.noData = true;
            ctrl.gridOptions.gridContainerClass = ctrl.sitOptions ? ctrl.sitOptions.gridContainerClass : '';
            ctrl.gridOptions.alwaysShowPager = ctrl.sitOptions ? ctrl.sitOptions.alwaysShowPager : false;
            ctrl.gridOptions.containerID = 'gridViewDiv';
            ctrl.gridOptions.enablePaging = ctrl.sitOptions ? ctrl.sitOptions.enablePaging : false;
            ctrl.gridOptions.handleResize = ctrl.handleResize;      // force grid to handle resizing even though a specific height is set.
            ctrl.gridOptions.height = ctrl.collectionHeight;
            ctrl.gridOptions.rowHeight = ctrl.sitOptions.rowHeight;
            ctrl.gridOptions.groups = ctrl.sitOptions ? ctrl.sitOptions.groupField !== '' ? [ctrl.sitOptions.groupField] : [] : [];
            ctrl.gridOptions.groupFieldSource = window.$UIF.Object.safeGet(ctrl, 'sitOptions.groupFieldSource');
            ctrl.gridOptions.tagsManager = !ctrl.sitOptions.tagsManager ? ctrl.sitOptions.tagsManager : true;
            ctrl.gridOptions.tagsManagerOptions = !ctrl.sitOptions.tagsManagerOptions ? ctrl.sitOptions.tagsManagerOptions : { entityName: '', appName: '' };
            ctrl.gridOptions.exportManager = !ctrl.sitOptions.exportManager ? ctrl.sitOptions.exportManager : true;
            ctrl.gridOptions.exportManagerOptions = !ctrl.sitOptions.exportManagerOptions ? ctrl.sitOptions.exportManagerOptions : { entityName: '', appName: '' };
            ctrl.gridOptions.serverDataOptions = !ctrl.sitOptions.serverDataOptions ? ctrl.sitOptions.serverDataOptions : { dataEntity: '', appName: '' };
            ctrl.gridOptions.pageManager = ctrl.pageManager;
            ctrl.gridOptions.pagingOptions = localPageOptions;
            ctrl.gridOptions.quickSearchOptions = ctrl.sitOptions ? ctrl.sitOptions.quickSearchOptions : [];
            ctrl.gridOptions.quickSearchType = ctrl.sitOptions && ctrl.sitOptions.quickSearchType ? ctrl.sitOptions.quickSearchType : '';
            ctrl.gridOptions.noDataMessage = ctrl.sitOptions ? ctrl.sitOptions.noDataMessage : '';
            ctrl.gridOptions.onPageChangedCallback = ctrl.sitOptions ? ctrl.sitOptions.onPageChangedCallback : null;
            ctrl.gridOptions.onSelectionChangeCallback = ctrl.sitOptions ? ctrl.sitOptions.onSelectionChangeCallback : null;
            // the grid may initiate a sort, so we need to handle in this controller. ctrl func will call callback if exists.
            ctrl.gridOptions.onSortingChangedCallback = ctrl.sortingChangedCallback;
            ctrl.gridOptions.selectionMode = ctrl.sitOptions ? ctrl.sitOptions.selectionMode : '';
            ctrl.gridOptions.noScroll = ctrl.sitOptions ? ctrl.sitOptions.noScroll : false;
            ctrl.gridOptions.debug = ctrl.sitOptions ? ctrl.sitOptions.debug : false;
            ctrl.gridOptions.enableResponsiveBehaviour = ctrl.sitOptions ? ctrl.sitOptions.enableResponsiveBehaviour : false;
            ctrl.gridOptions.uniqueID = ctrl.sitOptions.uniqueID ? ctrl.sitOptions.uniqueID : '';
            ctrl.gridOptions.parent = 'ICV';
            ctrl.gridOptions.svgIcon = ctrl.sitOptions.svgIcon ? ctrl.sitOptions.svgIcon : '';
            ctrl.gridOptions.typeIcon = ctrl.sitOptions.typeIcon ? ctrl.sitOptions.typeIcon : '';
            //Fix 30073 : Initializing the sorting fields in grid
            ctrl.gridOptions.sortInfo = {
                fields: [],
                directions: [],
                columns: [],
                fieldSource: null
            };
            updateGridSortOptions();
            ctrl.gridOptions.tagField = ctrl.sitOptions ? ctrl.sitOptions.tagField : null;
            assignTagsToGrid();
            angular.forEach(ctrl.gridOptions.columnDefs, function (columnDef) {
                columnDef.visible = typeof columnDef.visible === 'boolean' ? columnDef.visible : true;
            });
            ctrl.gridColumnDefs = $.extend(true, [], ctrl.gridOptions.columnDefs);
        }

        function updateGridSortOptions() {
            if (ctrl.sitOptions && ctrl.sitOptions.sortInfo) {
                var sortFields = [];
                if (ctrl.sitOptions.sortInfo.field) {
                    !ctrl.gridOptions.sortInfo.fields.length && ctrl.gridOptions.sortInfo.fields.push(ctrl.sitOptions.sortInfo.field);
                    !ctrl.gridOptions.sortInfo.directions.length && ctrl.gridOptions.sortInfo.directions.push(ctrl.sitOptions.sortInfo.direction);
                    ctrl.gridOptions.sortInfo.fieldSource = window.$UIF.Object.safeGet(ctrl, 'sitOptions.sortInfo.fieldSource');

                    sortFields.push(ctrl.sitOptions.sortInfo.field);
                }
                if (ctrl.sitOptions.sortInfo.fields) {
                    angular.forEach(ctrl.sitOptions.sortInfo.fields, function (sortField) {
                        var field = sortField.hasOwnProperty('field') ? sortField.field : sortField;
                        sortFields.push(field);
                    });
                }
                angular.forEach(ctrl.gridOptions.columnDefs, function (columnDef) {
                    columnDef.sortable = false;
                    if (-1 < sortFields.indexOf(columnDef.field)) {
                        columnDef.sortable = true;
                    }
                });
            }
        }

        function assignTagsToGrid() {
            if (ctrl.gridOptions.tagField && ctrl.gridOptions.columnDefs) {
                ctrl.gridOptions.columnDefs.push({
                    field: tagsField,
                    displayName: tagsColumnName,
                    sortable: false,
                    cellTemplate: "<div  id='data-cell-container' class='ngCellText' ng-class='col.colIndex()'>" +
                        "<sit-tag-list ng-show='row[\"entity\"][\"" + tagsField + "\"].length > 0' sit-data='row[\"entity\"][\"" + tagsField + "\"]'></sit-tag-list></div>"
                });
            }
        }

        function initializeViewBarOptions() {
            // view bar options
            viewOptions = ctrl.sitOptions ? ctrl.sitOptions.viewOptions.toLowerCase() : '';
            if (compactMode) {
                ctrl.viewBarOptions = {
                    grid: { show: false },
                    smallTile: { show: false },
                    mediumTile: { show: false },
                    largeTile: { show: false },
                    check: { show: false },
                    details: { show: false }
                };
            } else {
                ctrl.viewBarOptions = {
                    grid: {
                        id: ctrl.sitOptions ? ctrl.sitOptions.containerID : '',
                        show: viewOptions && viewOptions.indexOf('g') !== -1,
                        selected: ctrl.sitOptions ? ctrl.sitOptions.viewMode === 'g' : false,
                        onClickCallback: function () {
                            changeViewMode('grid');
                        }
                    },
                    smallTile: {
                        id: ctrl.sitOptions ? ctrl.sitOptions.containerID : '',
                        show: viewOptions && viewOptions.indexOf('s') !== -1,
                        selected: ctrl.sitOptions ? ctrl.sitOptions.viewMode === 's' : false,
                        onClickCallback: function () {
                            changeViewMode('tile', 'medium');
                        }
                    },
                    mediumTile: {
                        id: ctrl.sitOptions ? ctrl.sitOptions.containerID : '',
                        show: viewOptions && viewOptions.indexOf('m') !== -1,
                        selected: ctrl.sitOptions ? ctrl.sitOptions.viewMode === 'm' : false,
                        onClickCallback: function () {
                            changeViewMode('tile', 'wide');
                        }
                    },
                    largeTile: {
                        id: ctrl.sitOptions ? ctrl.sitOptions.containerID : '',
                        show: viewOptions && viewOptions.indexOf('l') !== -1,
                        selected: ctrl.sitOptions ? ctrl.sitOptions.viewMode === 'l' : false,
                        onClickCallback: function () {
                            changeViewMode('tile', 'large');
                        }
                    },
                    check: {
                        id: ctrl.sitOptions ? ctrl.sitOptions.containerID : '',
                        show: ctrl.sitOptions ? ctrl.sitOptions.selectionMode !== 'none' && viewOptions && viewOptions.indexOf('x') !== -1 : false,
                        selected: ctrl.sitOptions ? ctrl.sitOptions.selectionMode === 'multi' : false,
                        onClickCallback: function (multiSelect) {
                            var mode = multiSelect ? 'multi' : 'single';
                            ctrl.sitOptions.selectionMode = mode;
                            ctrl.tileViewOptions.multiSelect = multiSelect;
                            ctrl.tileViewOptions.selectionMode = mode;
                            ctrl.gridOptions.selectionMode = mode;
                            // change gridOptions object to trigger grid's watch on the options
                            ctrl.gridOptions = $.extend(true, {}, ctrl.gridOptions);
                            logger.log('selection mode button callback', 'selection mode changed to ' + mode);
                            ctrl.viewBarOptions.check.show = ctrl.sitOptions ? ctrl.sitOptions.selectionMode !== 'none' && viewOptions && viewOptions.indexOf('x') !== -1 : false;
                            ctrl.viewBarOptions.check.selected = ctrl.sitOptions ? ctrl.sitOptions.selectionMode === 'multi' : false;
                        }
                    },
                    details: {
                        id: ctrl.sitOptions ? ctrl.sitOptions.containerID : '',
                        show: viewOptions && viewOptions.indexOf('d') !== -1,
                        selected: false,
                        onClickCallback: function () {
                        }
                    }
                };
            }
        }

        function setCollectionStyle() {
            ctrl.initializeHeight();
            return ctrl.collectionStyle;
        }

        function setCollectionHeight(height) {
            var HEADER_HEIGHT = 54;
            var SEARCH_ENABLED_HEADER_HEIGHT = 94;
            //if both the sort and search controls are showing in compact mode, they will stack.
            //NOTE: tried to add api methods to filterbar, but the link function on this directive
            //      (which calls the initialize height method) is called before the controller function of the
            //      filterbar directive (which adds the api functions.). Thought all controllers called before linking phase...
            //      So below is code duplication to see what filter bar contols are showing
            var displayOptions = ctrl.sitOptions ? ctrl.sitOptions.filterBarOptions.toLowerCase() : '';
            var searchVisible = displayOptions.indexOf('q') !== -1;
            if (compactMode && searchVisible) {
                HEADER_HEIGHT = ctrl.isCompactQuickSearchEnabled ? SEARCH_ENABLED_HEADER_HEIGHT : HEADER_HEIGHT;
            }
            ctrl.collectionHeight = height - HEADER_HEIGHT;
            ctrl.collectionStyle = { "height": ctrl.collectionHeight + 'px' };
        }

        function setHeight(height) {
            if (!height) {
                height = ctrl.sitOptions ? getElementHeight(ctrl.sitOptions.containerID) : 0;
            }
            if (height <= 0) {
                return;
            }

            setCollectionHeight(height);

            // in case of multiple ICVs on a page, sets height only for decendents of specified container
            DOM_ELEMENTS.itemCollectionViewerContainer.height(height);
            DOM_ELEMENTS.itemCollectionCanvas.height(ctrl.collectionHeight);
            element.find(DOM_REFRENCES.noDataDiv).height(ctrl.collectionHeight);
            element.find(DOM_REFRENCES.gridViewDiv).height(ctrl.collectionHeight);
            element.find(DOM_REFRENCES.tileViewDiv).height(ctrl.collectionHeight);

            logger.log('icvCtrl.setHeight', 'widgetHeight: ' + height + 'px, collectionHeight: ' + ctrl.collectionHeight + 'px');
        }

        function checkResponsiveness(width) {
            if (!ctrl.sitOptions.enableResponsiveBehaviour) {
                return;
            }
            if (width < 500) {
                if (ctrl.sitOptions.viewMode !== 'c' && !ctrl.isCompactView) {
                    setPreviousViewMode();
                    ctrl.sitOptions.viewMode = 'c';
                    reinitializeICV();
                    ctrl.isCompactView = true;
                    if (ctrl.isCompactView && ctrl.prevViewMode === 'g') {
                        globalDialogService.hide();
                    }

                }
            } else {
                if (ctrl.sitOptions.viewMode === 'c' && ctrl.isCompactView) {
                    ctrl.sitOptions.viewMode = ctrl.prevViewMode;
                    reinitializeICV();
                    ctrl.isCompactView = false;
                    if (!ctrl.isCompactView && ctrl.prevViewMode === 'g') {
                        globalDialogService.hide();
                    }
                }
            }
        }

        function setGridHeight() {
            ctrl.gridOptions.handleResize = ctrl.handleResize;
            ctrl.gridOptions.height = ctrl.collectionHeight;
        }

        function setTileHeight() {
            ctrl.tileViewOptions.handleResize = ctrl.handleResize;
            ctrl.tileViewOptions.viewHeight = ctrl.collectionHeight;
        }

        function initializeHeight() {
            var widgetHeight = 0;
            if (ctrl.sitOptions) {
                if (ctrl.sitOptions.height) {
                    widgetHeight = ctrl.sitOptions.height;
                } else if (ctrl.sitOptions.containerID) {
                    widgetHeight = getElementHeight(ctrl.sitOptions.containerID);
                    if (widgetHeight > 0) {
                        ctrl.handleResize = true;
                    }
                }
            }

            if (widgetHeight > 0) {
                ctrl.setHeight(widgetHeight);
                setGridHeight();
                setTileHeight();
            } else if (widgetHeight <= 0) {
                $timeout(function () {
                    widgetHeight = getElementHeight(ctrl.sitOptions.containerID);
                    // default to half the window height
                    if (widgetHeight <= 0) widgetHeight = Math.ceil($(window).height() / 2);
                    ctrl.setHeight(widgetHeight);
                    setGridHeight();
                    setTileHeight();
                    ctrl.tileViewOptions.setTileViewHeight && ctrl.tileViewOptions.setTileViewHeight();
                }, 0, false);
            }
        }


        function setPreviousViewMode() {
            if (ctrl.viewMode === 'grid') {
                ctrl.prevViewMode = 'g';
            } else if (ctrl.viewMode === 'tile') {
                if (ctrl.tileViewOptions.tileSize === 'medium') {
                    ctrl.prevViewMode = 's';
                } else if (ctrl.tileViewOptions.tileSize === 'wide') {
                    ctrl.prevViewMode = 'm';
                } else {
                    ctrl.prevViewMode = 'l';
                }
            }
        }

        function reinitializeICV() {
            ctrl.resetView = false;
            viewMode = ctrl.sitOptions ? ctrl.sitOptions.viewMode.toLowerCase() : '';
            compactMode = viewMode === 'c';
            ctrl.compactStyle = compactMode ? { width: '269px' } : '';
            setPageManager(true);
            ctrl.sitTileConfig.viewMode = viewMode;
            filterBarSearchText = ctrl.sitOptions.getSearchText();
            filterBarGroupField = ctrl.sitOptions.getGroupField();
            filterBarGroupFieldSource = ctrl.sitOptions.getGroupFieldSource();
            filterBarSortInfo = ctrl.sitOptions.getSortInfo();

            setTileAndGridOptions();
            initializeViewBarOptions();
            setFilterBarOptions();

            $timeout(function () {
                ctrl.resetView = true;
            });
        }

        function setTileAndGridOptions() {

            if (ctrl.sitOptions.viewMode !== "g") {
                ctrl.tileViewOptions.alwaysShowPager = ctrl.sitOptions && compactMode ? false : ctrl.sitOptions.alwaysShowPager;
                ctrl.tileViewOptions.enablePaging = ctrl.sitOptions && compactMode ? false : ctrl.sitOptions.enablePaging;
                ctrl.tileViewOptions.multiSelect = ctrl.sitOptions && ctrl.sitOptions.selectionMode ? ctrl.sitOptions.selectionMode === 'multi' : false;
                ctrl.tileViewOptions.selectStyle = ctrl.sitOptions && compactMode ? 'alternate' : ctrl.sitOptions.selectStyle;
                ctrl.tileViewOptions.isCompactMode = false;

                if (compactMode) {
                    ctrl.tileViewOptions.isCompactMode = true;
                    ctrl.tileViewOptions.tileSize = 'medium';
                    ctrl.tileViewOptions.tileTemplate = ctrl.sitOptions ? ctrl.sitOptions.smallTileTemplate : '';
                    ctrl.sitTileConfig.tileTemplate = ctrl.sitOptions ? ctrl.sitOptions.smallTileTemplate : '';
                }

                ctrl.tileViewOptions.quickSearchOptions.filterText = filterBarSearchText;
                ctrl.tileViewOptions.groupBy = filterBarGroupField;
                ctrl.tileViewOptions.groupByFieldSource = filterBarGroupFieldSource;
                ctrl.tileViewOptions.sortInfo = filterBarSortInfo;

            } else {
                ctrl.gridOptions.quickSearchOptions.filterText = filterBarSearchText;
                ctrl.gridOptions.groups = [filterBarGroupField];
                ctrl.gridOptions.groupFieldSource = filterBarGroupFieldSource;
                ctrl.gridOptions.sortInfo = {
                    fields: [],
                    directions: [],
                    columns: []
                };
                ctrl.gridOptions.sortInfo.fields.push(filterBarSortInfo.field ? filterBarSortInfo.field : ctrl.sitOptions.sortInfo.field);
                ctrl.gridOptions.sortInfo.directions.push(filterBarSortInfo.direction ? filterBarSortInfo.direction : ctrl.sitOptions.sortInfo.direction);
                ctrl.gridOptions.sortInfo.fieldSource = filterBarSortInfo.fieldSource || ctrl.sitOptions.sortInfo.fieldSource;

            }
        }

        function setFilterBarOptions() {
            ctrl.filterOptions.quickSearchText = filterBarSearchText;
            ctrl.filterOptions.currentGroupField = filterBarGroupField;
            ctrl.filterOptions.currentGroupFieldSource = filterBarGroupFieldSource;
            ctrl.filterOptions.currentSortDirection = filterBarSortInfo.direction ? filterBarSortInfo.direction : ctrl.sitOptions.sortInfo.direction;
            ctrl.filterOptions.currentSortField = filterBarSortInfo.field ? filterBarSortInfo.field : ctrl.sitOptions.sortInfo.field;
            ctrl.filterOptions.currentSortFieldSource = filterBarSortInfo.fieldSource || ctrl.sitOptions.sortInfo.fieldSource;
            ctrl.filterOptions.displayOptions = ctrl.sitOptions ? ctrl.sitOptions.filterBarOptions + (compactMode ? 'c' : '') : '';
            ctrl.filterOptions.displayOptions = ctrl.sitOptions.userPrefId ? ctrl.filterOptions.displayOptions + 'p' : ctrl.filterOptions.displayOptions;
            ctrl.filterOptions.viewBarOptions = ctrl.viewBarOptions;
        }

        function getIsEntitySegregable() {
            if (!tagsManagementService.isDataSegregationEnabled()) {
                ctrl.IsEntitySegregable = false;
                return;
            }
            var success = function (data) {
                ctrl.IsEntitySegregable = data.value[0].EntityInfo.IsSegregable;
            };
            var error = function (error) {
                logger.log(error);
            };
            var appinfo = getAppInfo();
            if (appinfo.Name && appinfo.Entity) {
                tagsManagementService.getCompositionInfo(appinfo.Name, appinfo.Entity).then(success, error);
            }
        }

        function getElementHeight(id) {
            var height = 0;
            var container = element.parents('#' + id);
            if (container.length === 0) {
                return height;
            }
            if (container.is(':visible')) {
                height = container.height()-1;
            } else {
                if (-1 === container.css('height').indexOf('%')) {
                    height = container.height()-1;
                } else {
                    height = 0;
                }
            }
            return height;
        }

        // set page manager here to share between grid/tile views
        function setPageManager(setViewMode) {

            if (ctrl.pageManager !== undefined && ctrl.sitOptions.pagingOptions) {
                ctrl.sitOptions.pagingOptions.pageSize = ctrl.pageManager.getPageSize();
                ctrl.sitOptions.pagingOptions.currentPage = ctrl.pageManager.getCurrentPage();
            }
            ctrl.pageManager = uyPageService.getPageManager(ctrl.sitOptions ? ctrl.sitOptions : {}, ctrl.sitData);

            if (setViewMode) {
                if (compactMode) {
                    ctrl.viewMode = 'compact';
                } else if (ctrl.sitOptions && (ctrl.sitOptions.viewMode === 'g' || ctrl.sitOptions.viewMode === 'G')) {
                    ctrl.viewMode = 'grid';
                } else {
                    ctrl.viewMode = 'tile';
                }
            }
        }

        function sortingChangedCallback(sortInfo) {
            ctrl.filterOptions.changeSort(sortInfo.field, sortInfo.direction, sortInfo.fieldSource);
            if (ctrl.sitOptions) {
                if (ctrl.sitOptions.onSortingChangedCallback) {
                    ctrl.sitOptions.onSortingChangedCallback(sortInfo);
                }
            }
        }

        if (ctrl.sitOptions) {
            ctrl.sitOptions.getSelectedItems = function () {
                if (ctrl.viewMode === 'grid') {
                    //if no data, grid ctrl may never have been called to create the getSelectedItems func
                    return ctrl.gridOptions.getSelectedItems ? ctrl.gridOptions.getSelectedItems() : [];
                }
                return ctrl.tileViewOptions.getSelectedItems ? ctrl.tileViewOptions.getSelectedItems() : [];

            };
        }

        // apply the given filter clauses to the grid or tile data
        function applyFilter(clauses) {
            ctrl.filterOptions.setFilterSelected(!!clauses && clauses.length > 0);
            ctrl.showFilter = false;
            // call initializeHeight after applying filter to set the height of dialog
            if (element.parents().find('.entity-picker-popup').length) {
                initializeHeight();
            }
            selectAll(false);
            if (ctrl.viewMode === 'grid') {
                ctrl.gridOptions.setFilter(clauses);
            } else {
                ctrl.tileViewOptions.setFilter(clauses);
            }
        }

        // clear any filtering in the grid or tile view
        function resetFilter() {
            ctrl.filterOptions.setFilterSelected();
            if (ctrl.viewMode === 'grid') {
                ctrl.gridOptions.setFilter([]);
            } else {
                ctrl.tileViewOptions.setFilter([]);
            }
        }

        function changeViewMode(mode, size) {
            ctrl.viewMode = mode;
        }


        function showSegregationTagsDialog() {
            var currentState = $state.current.name;
            var icvId = $scope.$id;
            var selectedItems = [];
            if (ctrl.viewMode === 'grid') {
                selectedItems = ctrl.gridOptions.selectedItems;
            } else {
                selectedItems = ctrl.tileViewOptions.selectedItem;
            }
            if (ctrl.isTagsMgtUserAuthorized && selectedItems.length != 0 && (ctrl.sitOptions.tagsManagerOptions || ctrl.sitOptions.serverDataOptions)) {
                var appinfo = getAppInfo();
                if (appinfo.Name && appinfo.Entity) {
                    if ($state.current.name.lastIndexOf('TagsMgt') >= 0) {
                        var tree = currentState.split('.');
                        tree.splice(tree.length - 1, 1);
                        currentState = tree.join('.');
                    }
                    $state.go(currentState + '.' + icvId + 'TagsMgt', {
                        objId: selectedItems[0].Id,
                        objIdType: typeof (selectedItems[0].Id),
                        entity: appinfo.Entity,
                        app: appinfo.Name,
                        refresh: refresh
                    }, { reload: false });
                }
                else {
                    logger.error('Tags Manager', 'Missing Entity Name or Application Name');
                }
            }
        }

        function showExportDialog() {
            var currentState = $state.current.name;
            //var icvId = $scope.$id;
            var selectedItems = [];
            if (ctrl.viewMode === 'grid') {
                selectedItems = ctrl.gridOptions.selectedItems;
            } else {
                selectedItems = ctrl.tileViewOptions.getSelectedItems();
            }
            if (selectedItems.length != 0 && (ctrl.sitOptions.exportManagerOptions)) {
                var appinfo = getAppInfo();
                var selectedItemsIds = selectedItems.map(function (i) { return i.Id; });
                if (appinfo.Name && appinfo.Entity) {
                    if ($state.current.name.lastIndexOf('ExportMgt') >= 0) {
                        var tree = currentState.split('.');
                        tree.splice(tree.length - 1, 1);
                        currentState = tree.join('.');
                    }
                    $state.go(currentState + '.Export', {
                        objIds: selectedItemsIds,
                        entity: appinfo.Entity,
                        app: appinfo.Name
                    }, { reload: false });
                }
                else {
                    logger.log('Export', 'Missing Entity Name or Application Name');
                }
            }
        }


        function getAppInfo() {

            if (ctrl.sitOptions.tagsManagerOptions) {
                return {
                    Name: ctrl.sitOptions.tagsManagerOptions.appName,
                    Entity: ctrl.sitOptions.tagsManagerOptions.entityName,
                    ReadingFunction: ctrl.sitOptions.tagsManagerOptions.readingFunctionName || null
                };
            }

            if (ctrl.sitOptions.exportManagerOptions) {
                return {
                    Name: ctrl.sitOptions.exportManagerOptions.appName,
                    Entity: ctrl.sitOptions.exportManagerOptions.entityName
                };
            }

            if (ctrl.sitOptions.serverDataOptions) {
                return {
                    Name: ctrl.sitOptions.serverDataOptions.appName,
                    Entity: ctrl.sitOptions.serverDataOptions.dataEntity
                };
            }

            return {
                Name: null,
                Entity: null
            };

        }

        function showUserPrefrencesDialog() {
            var views = ctrl.sitOptions.viewOptions;
            var isOnlyGrid = ['', 'g'].indexOf(views) !== -1 && ctrl.viewMode !== 'compact';
            var isOnlyTile = ctrl.viewMode === 'compact' || (views !== '' && views.indexOf('g') === -1);
            var isTileAndGrid = ctrl.viewMode !== 'compact' && views !== '' && views.length > 2 || views.indexOf('g') !== -1

            if ((ctrl.viewMode === 'tile' || ctrl.viewMode === 'compact') && isOnlyTile) {
                var tileDialogData = {
                    title: ctrl.TileDialogTitle,
                    templatedata: {
                        data: ctrl.sitTileConfig,
                        reset: ctrl.buttonsTileList[1],
                        viewMode: 'tile'
                    },
                    templateuri: 'common/widgets/itemCollectionViewer/tile-personalization.html',
                    buttons: ctrl.buttonsTileList
                };
                globalDialogService.set(tileDialogData);
                globalDialogService.show();
            } else if (ctrl.viewMode === 'grid' && isOnlyGrid) {
                var gridDialogData = {
                    title: ctrl.GridDialogTitle,
                    templatedata: {
                        data: ctrl.sitConfig,
                        reset: ctrl.buttonsGridList[1],
                        viewMode: 'grid'
                    },
                    templateuri: 'common/widgets/itemCollectionViewer/grid-personalization.html',
                    buttons: ctrl.buttonsGridList
                };
                globalDialogService.set(gridDialogData);
                globalDialogService.show();
            } else if (isTileAndGrid && (ctrl.viewMode === 'grid' || ctrl.viewMode === 'tile') && ctrl.viewMode !== 'compact') {
                if (ctrl.defaultViewMode !== 'grid') {
                    ctrl.defaultViewMode = 'tile';
                }

                ctrl.selectedViewMode = ctrl.defaultViewMode;

                var dialogData = {
                    title: $translate.instant('userPrefrences.title.tileGrid', ctrl.sitOptions),
                    templatedata: {
                        radio: {
                            value: ctrl.defaultViewMode,
                            options: [{ label: $translate.instant('userPrefrences.table'), name: $translate.instant('userPrefrences.table'), value: "grid" }, { label: $translate.instant('userPrefrences.list'), name: $translate.instant('userPrefrences.list'), value: "tile" }],
                            onChange: function (oldValue, newValue) {
                                ctrl.selectedViewMode = newValue;
                            }
                        },
                        selectTab: function (data, viewMode) {
                            if (viewMode === 'tile') {
                                data.tile.isTileActve = true;
                                data.tile.isGridActve = false;
                            } else {
                                data.tile.isTileActve = false;
                                data.tile.isGridActve = true;
                            }

                        },
                        grid: {
                            isGridActive: ctrl.viewMode === 'grid',
                            data: ctrl.sitConfig,
                            reset: {
                                onClickCallback: function () {
                                    if (ctrl.sitOptions && ctrl.sitOptions.viewOptions.toLowerCase() !== '') {
                                        showOverlay('grid');
                                    } else {
                                        resetUserPrefrences('grid');
                                        globalDialogService.hide();
                                    }
                                }
                            }
                        },
                        tile: {
                            isTileActve: (ctrl.viewMode === 'tile' || ctrl.viewMode === 'compact'),
                            data: ctrl.sitTileConfig,
                            reset: {
                                onClickCallback: function () {
                                    if (ctrl.sitOptions && ctrl.sitOptions.viewOptions.toLowerCase() !== '') {
                                        showOverlay('tile');
                                    } else {
                                        resetUserPrefrences('tile');
                                        globalDialogService.hide();
                                    }
                                }
                            }
                        }
                    },
                    templateuri: 'common/widgets/itemCollectionViewer/grid-tile-personalization.html',
                    buttons: getGridTileButtons()
                };
                globalDialogService.set(dialogData);
                globalDialogService.show();
            }
        }

        function resetGridColumnsWidth() {
            $rootScope.$broadcast('sit-filter.resetColumnsWidth', null, 'sitFilterPanel');
        }

        // filter bar options
        function updateFilterBarOptions() {
            var filterConfig = window.$UIF.Object.safeGet(ctrl.sitOptions, 'serverDataOptions.dataService.filterConfigToSave');
            ctrl.filterOptions = {
                noData: true,
                tagsManagerButton: ctrl.TagsManagerVisibility,
                exportManagerButton: ctrl.ExportManagerVisibility,
                quickSearchText: ctrl.sitOptions && ctrl.sitOptions.quickSearchOptions && ctrl.sitOptions.quickSearchOptions.filterText ?
                    ctrl.sitOptions.quickSearchOptions.filterText : '',
                currentGroupField: ctrl.sitOptions ? ctrl.sitOptions.groupField : '',
                currentGroupFieldSource: window.$UIF.Object.safeGet(ctrl, 'sitOptions.groupFieldSource'),
                currentSortDirection: ctrl.sitOptions ? ctrl.sitOptions.sortInfo.direction : '',
                currentSortField: ctrl.sitOptions ? ctrl.sitOptions.sortInfo.field : '',
                currentSortFieldSource: window.$UIF.Object.safeGet(ctrl, 'sitOptions.sortInfo.fieldSource'),
                displayOptions: ctrl.sitOptions ? ctrl.sitOptions.filterBarOptions + (compactMode ? 'c' : '') : '',
                isDataRetrieved: filterConfig !== null && Object.keys(filterConfig).length > 0,
                isServerData: ctrl.pageManager.isServerData(),
                userPrefData: ctrl.filterbarUserPrefData,
                onFilterClickCallback: function () {
                    ctrl.showFilter = !ctrl.showFilter;
                    if (ctrl.showFilter) {
                        if (ctrl.sitOptions.filterFields && !ctrl.sitOptions.filterFields.type) {
                            var container = $("#" + ctrl.sitOptions.containerID);
                            container.find('#filter').css('max-height', ctrl.collectionHeight * 0.3);
                        }
                        if (element.parent().get(0).className === "entity-picker-popup") {
                            var filterHeightInEntityPickerPopup = 280;
                            $('.entity-picker-popup').css('overflow', 'hidden');
                            ctrl.sitOptions.height = $('.entity-picker-popup').height() - filterHeightInEntityPickerPopup;
                            initializeHeight();
                            $rootScope.$broadcast('sit-dialog-layout-change', { eventSource: 'dialogFilterBuilder' });
                            ctrl.sitOptions.height = undefined;
                            ctrl.sitOptions.containerID = "globalDialogId-entity-picker-popup";
                        }
                    }
                    else if (!ctrl.showFilter && element.parent().get(0).className === "entity-picker-popup") {
                        initializeHeight();
                        $rootScope.$broadcast('sit-dialog-layout-change', { eventSource: 'dialogFilterBuilder' });
                    }
                },
                groupByFields: ctrl.sitOptions ? ctrl.sitOptions.groupFields : '',
                onGroupChangeCallback: function (group, groupFieldSource) {
                    logger.log('onGroupChangeCallback', 'selected group field: ' + group);
                    ctrl.gridOptions.groups = group ? [group] : [];
                    ctrl.gridOptions.groupFieldSource = groupFieldSource || null;
                    ctrl.tileViewOptions.groupBy = group ? group : '';
                    ctrl.tileViewOptions.groupByFieldSource = groupFieldSource || null;
                },
                downloadOptions: {
                    enabled: ctrl.sitOptions.downloadOptions.enabled,
                    onClick: onDownloadClick,
                    tooltip: ctrl.sitOptions.printOptions.enabled ? $translate.instant(ctrl.sitOptions.printOptions.tooltip) : ''// printOption - Backward compatibility for DAF
                },
                quickSearchField: ctrl.sitOptions ? ctrl.sitOptions.quickSearchOptions.field : '',
                quickSearchPlaceholder: getQuickSearchPlaceholder(),
                onSearchChangeCallback: function (searchText) {
                    var message = 'quick search: text: [' + searchText + '].';
                    logger.log('onSearchChangeCallback', message);
                    if (ctrl.viewMode === 'grid') {
                        ctrl.gridOptions.quickSearchOptions.filterText = searchText;
                    } else {
                        ctrl.tileViewOptions.quickSearchOptions.filterText = searchText;
                    }
                    $rootScope.$on('sit-grid.data-filtered', function () {
                        $rootScope.$broadcast('sit-item-collection-viewer.data-search-completed');
                    });
                    selectAll(false);
                },
                //sortByFields: ctrl.sitOptions.sortFields,
                sortByFields: (window.$UIF.Object.safeGet(ctrl, 'sitOptions.sortInfo.fields.length') ? ctrl.sitOptions.sortInfo.fields :
                    ctrl.sitOptions.sortInfo.field ? [ctrl.sitOptions.sortInfo.field] : ''),
                onSortChangeCallback: function (field, direction, fieldSource) {
                    var message = 'sort changed: field: [' + field + '], direction: [' + direction + '].';
                    logger.log('onSortChangeCallback', message);
                    if (ctrl.viewMode === 'grid') {
                        if (ctrl.gridOptions.sortBy) {
                            ctrl.gridOptions.sortBy(field, direction, fieldSource);
                        }
                    } else {
                        var si = {
                            field: field,
                            direction: direction,
                            fieldSource: fieldSource
                        };
                        ctrl.tileViewOptions.sortInfo = si;
                    }
                },
                onPreferenceButtonClicked: function () {
                    showUserPrefrencesDialog();
                },
                onResetColumnsWidthButtonClicked: function () {
                    resetGridColumnsWidth();
                },
                onSegregationTagsButtonClicked: function () {
                    showSegregationTagsDialog();
                },
                onExportButtonClicked: function () {
                    showExportDialog();
                },
                filterFields: ctrl.sitOptions ? ctrl.sitOptions.filterFields : '',
                customButtons: ctrl.sitOptions.customButtons ? ctrl.sitOptions.customButtons : []
            };
            // verify quick search field is set if configured to show. If not, do not show quick search
            if (ctrl.filterOptions.displayOptions) {
                var qIndex = ctrl.filterOptions.displayOptions.toLowerCase().indexOf("q");
                if (qIndex !== -1 && (!ctrl.filterOptions.quickSearchField || ctrl.filterOptions.quickSearchField.length === 0)) {
                    if (ctrl.sitOptions) {
                        ctrl.filterOptions.displayOptions = ctrl.filterOptions.displayOptions.replace('q', '');
                    }
                    logger.warn('setFilterOptions', 'Quick Search control configured to display but no search field specified. Not showing control.');
                }
                ctrl.filterOptions.displayOptions = ctrl.filterOptions.displayOptions + 'p';
                if (ctrl.sitOptions && !ctrl.sitOptions.userPrefId) {
                    ctrl.filterOptions.displayOptions = ctrl.filterOptions.displayOptions.replace('p', '');
                }
            }
        }

        function onDownloadClick() {
            download({
                fileName: ctrl.sitOptions.downloadOptions.fileName,
                separator: ctrl.sitOptions.downloadOptions.separator,
                started: ctrl.sitOptions.downloadOptions.started,
                completed: ctrl.sitOptions.downloadOptions.completed
            });
        }

        function download(downloadOptions) {
            var data = [];
            var isGrouped = false;

            //grouped data
            if (ctrl.gridOptions.gridGroupedData && ctrl.gridOptions.gridGroupedData.length) {
                isGrouped = true;
                var groupedData = ctrl.gridOptions.gridGroupedData;
                var groupedDataLength = ctrl.gridOptions.gridGroupedData.length;
                //loop to grouped items
                var index = 0;
                for (var i = 0; i < groupedDataLength; i = index) {
                    if (groupedData[i].children && groupedData[i].children.length) {
                        data = data.concat(groupedData[i].children);

                        //check if group expanded. If yes change the index to target next grouped array item
                        index = i + 1;
                        if (!groupedData[i].collapsed) {
                            index = index + groupedData[i].children.length
                        }
                    } else { index = i + 1; }
                }
            } else {
                data = getCurrentData();
            }

            var options = {
                widget: 'ICV',
                isGroupedData: isGrouped,
                downloadOptions: downloadOptions
            };

            ctrl.pageManager.download(data, ctrl.sitConfig.columnDefs, options);
        }

        function getQuickSearchPlaceholder() {
            if (ctrl.sitOptions.quickSearchOptions) {
                return {
                    displayName: ctrl.sitOptions.quickSearchOptions.displayName || '',
                    customText: ctrl.sitOptions.quickSearchOptions.placeholderText || ''
                };
            }
        }

        /**
        * @ngdoc method
        * @module siemens.simaticit.common.widgets.itemCollectionViewer
        * @name ICVOptions#refresh
        *
        * @description
        * An API used to refresh the ICV when used in server mode on change of any options.
        * It is not required in local mode.
        *  @param {Boolean} [resetDataFlag= undefined] If true, resets the grid option to its default value.
        *
        */
        function refresh(resetDataFlag) {
            ctrl.resetDataFlag = resetDataFlag;
            dataUpdated(resetDataFlag);
        }


        //method to update the ICV when data is changed or refresh API is called
        function dataUpdated(resetDataFlag) {
            if (resetDataFlag) {
                ctrl.resetData();
                ctrl.pageManager.setCurrentPage(1);
                $rootScope.$broadcast('grid.refreshList');
            }
            if (ctrl.gridOptions.dataUpdated && ctrl.viewMode === 'grid') {
                ctrl.gridOptions.dataUpdated();
            } else if (ctrl.tileViewOptions.dataUpdated) {
                ctrl.tileViewOptions.dataUpdated();
            }
        }

        function getDisplayNameFromSitOptions(field) {
            var displayName = '';
            var titleField = window.$UIF.Object.safeGet(ctrl.sitOptions, 'tileConfig.titleField');
            titleField = titleField && typeof titleField === 'object' ? titleField.field : titleField;
            var descriptionField = window.$UIF.Object.safeGet(ctrl.sitOptions, 'tileConfig.descriptionField');
            descriptionField = descriptionField && typeof descriptionField === 'object' ? descriptionField.field : descriptionField;
            if (!ctrl.userPreferences[field + 'Field']) {
                displayName = window.$UIF.Object.safeGet(ctrl.tileViewOptions, 'descriptionField.displayName') || ctrl.tileViewOptions.descriptionField || '';
            } else if (titleField === ctrl.userPreferences[field + 'Field']) {
                displayName = typeof ctrl.sitOptions.tileConfig.titleField === 'string' ? ctrl.sitOptions.tileConfig.titleField : ctrl.sitOptions.tileConfig.titleField.displayName;
            } else if (descriptionField === ctrl.userPreferences[field + 'Field']) {
                displayName = typeof ctrl.sitOptions.tileConfig.descriptionField === 'string' ? ctrl.sitOptions.tileConfig.descriptionField : ctrl.sitOptions.tileConfig.descriptionField.displayName;
            } else if (window.$UIF.Object.safeGet(ctrl.sitOptions, 'tileConfig.propertyFields')) {
                ctrl.sitOptions.tileConfig.propertyFields.forEach(function (propertyField) {
                    if (propertyField.field === ctrl.userPreferences[field + 'Field']) {
                        displayName = propertyField.displayName || propertyField.field;
                    }
                });
            }
            return displayName;
        }

        function resetData() {
            setPageManager(false);
            ctrl.tileViewOptions.pageManager = ctrl.gridOptions.pageManager = ctrl.pageManager;
            // gridConfig/tileConfig default to undefined on the options object
            if (ctrl.sitOptions) {
                if (ctrl.sitOptions.gridConfig) {
                    var icvGridCols = $.extend(true, [], ctrl.sitOptions.gridConfig.columnDefs);
                    var gridCols = $.extend(true, [], ctrl.gridOptions.columnDefs);
                    ctrl.gridOptions.columnDefs = mergeUiqueCols(gridCols, icvGridCols);
                }
                if (ctrl.sitOptions.tileConfig) {
                    getUserPrefrences();
                    if (ctrl.userPreferences && ctrl.resetDataFlag) {
                        ctrl.tileViewOptions.descriptionField = window.$UIF.Object.safeGet(ctrl.userPreferences, 'descriptionField.field')
                            || ctrl.userPreferences.descriptionField
                            || window.$UIF.Object.safeGet(ctrl.tileViewOptions, 'descriptionField.field')
                            || ctrl.tileViewOptions.descriptionField
                            || '';
                        ctrl.tileViewOptions.descriptionFieldDisplayName = getDisplayNameFromSitOptions('description');
                        ctrl.tileViewOptions.descriptionFieldSource = ctrl.userPreferences.descriptionFieldSource
                            || ctrl.tileViewOptions.descriptionFieldSource
                            || null;
                        ctrl.tileViewOptions.descriptionFieldFilter = ctrl.userPreferences.descriptionFieldFilter
                            || ctrl.tileViewOptions.descriptionFieldFilter
                            || null;
                        ctrl.tileViewOptions.titleField = window.$UIF.Object.safeGet(ctrl.userPreferences, 'titleField.field')
                            || ctrl.userPreferences.titleField
                            || window.$UIF.Object.safeGet(ctrl.tileViewOptions, 'titleField.field')
                            || ctrl.tileViewOptions.titleField
                            || '';
                        ctrl.tileViewOptions.titleFieldDisplayName = getDisplayNameFromSitOptions('title');
                        ctrl.tileViewOptions.titleFieldSource = ctrl.userPreferences.titleFieldSource
                            || ctrl.tileViewOptions.titleFieldSource
                            || null;
                        ctrl.tileViewOptions.titleFieldFilter = ctrl.userPreferences.titleFieldFilter
                            || ctrl.tileViewOptions.titleFieldFilter
                            || null;
                        ctrl.tileViewOptions.propertyFields = (ctrl.userPreferences.propertyFields && ctrl.userPreferences.propertyFields.length !== 0)
                            ? $.extend(true, [], ctrl.userPreferences.propertyFields)
                            : $.extend(true, [], ctrl.tileViewOptions.propertyFields);
                        ctrl.resetDataFlag = false;
                    } else {
                        ctrl.tileViewOptions.titleField = window.$UIF.Object.safeGet(ctrl.sitOptions.tileConfig, 'titleField.field')
                            || ctrl.sitOptions.tileConfig.titleField
                            || '';
                        ctrl.tileViewOptions.titleFieldSource = ctrl.sitOptions.tileConfig.titleFieldSource
                            || null;
                        ctrl.tileViewOptions.titleFieldFilter = ctrl.sitOptions.tileConfig.titleFieldFilter
                            || null;
                        ctrl.tileViewOptions.descriptionField = window.$UIF.Object.safeGet(ctrl.sitOptions.tileConfig, 'descriptionField.field')
                            || ctrl.sitOptions.tileConfig.descriptionField
                            || '';
                        ctrl.tileViewOptions.descriptionFieldSource = ctrl.sitOptions.tileConfig.descriptionFieldSource
                            || null;
                        ctrl.tileViewOptions.descriptionFieldFilter = ctrl.sitOptions.tileConfig.descriptionFieldFilter
                            || null;
                        ctrl.tileViewOptions.propertyFields = $.extend(true, [], ctrl.sitOptions.tileConfig.propertyFields);
                    }
                }
            }
            //update grid on sitData and ctrl.gridOptions.pageManager change.
            if (ctrl.gridOptions.onDataChange) {
                ctrl.gridOptions.onDataChange(ctrl.sitData);
            }
            if (ctrl.tileViewOptions.dataUpdated) {
                ctrl.tileViewOptions.dataUpdated();
            }
            if (ctrl.sitData && ctrl.sitData.length) {
                ctrl.noData = false;
            } else {
                ctrl.noData = true;
            }

            //update filter server requests
            ctrl.sitFilterOptions.hasOwnProperty('refresh') && ctrl.sitFilterOptions.refresh();

            //ctrl.dataUpdated();
            // both tile and grid have watches on local data and will respond
            // if we are sure those watch handlers execute after this, then we are OK.
            // otherwise, we need to make sure that these option changes are pushed to tile/grid
            // prior to their watch handlers executing.
        }

        function mergeUiqueCols(gridCols, icvGridCols) {
            return gridCols.concat(icvGridCols.filter(function (item) {
                return _.findIndex(gridCols, { field: item.field }) === -1;
            }));
        }

        //functions for item selection api
        function selectItems(items, state, clear) {
            //items is expected to be an array of numbers or objects
            if (!items || items.constructor !== Array) {
                return;
            }
            // defer work to active viewer
            if (ctrl.viewMode === 'grid') {
                if (ctrl.gridOptions && ctrl.gridOptions.selectItems) {
                    ctrl.gridOptions.selectItems(items, state, clear);
                }
            } else {
                if (ctrl.tileViewOptions && ctrl.tileViewOptions.selectItems) {
                    ctrl.tileViewOptions.selectItems(items, state, clear);
                }
            }
        }

        function selectAll(state) {
            if (ctrl.viewMode === 'grid') {
                if (ctrl.gridOptions && ctrl.gridOptions.selectAll) {
                    ctrl.gridOptions.selectAll(state);
                }
            } else {
                if (ctrl.tileViewOptions && ctrl.tileViewOptions.selectAll) {
                    ctrl.tileViewOptions.selectAll(state);
                }
            }
        }

        function expandGroup(field, value) {
            if (ctrl.viewMode === 'grid') {
                ctrl.gridOptions.expandGroup(field, value);
            }
        }

        function applyFilterCallback(clauses) {
            Array.isArray(clauses) && clauses.length > 0 && selectAll(false);
            if (ctrl.viewMode === 'grid') {
                ctrl.gridOptions.setFilter(clauses);
            } else {
                ctrl.tileViewOptions.setFilter(clauses);
            }
        }

        /**
        * @ngdoc method
        * @module siemens.simaticit.common.widgets.itemCollectionViewer
        * @name ICVOptions#getSearchText
        *
        * @description
        * An API method which returns quick search text from the filterbar.
        *
        * @returns {string} quick search text
        */
        function getSearchText() {
            var searchText = '';
            if (ctrl.filterOptions.hasOwnProperty('getSearchText')) {
                searchText = ctrl.filterOptions.getSearchText();
            }
            return searchText;
        }

        /**
        * @ngdoc method
        * @module siemens.simaticit.common.widgets.itemCollectionViewer
        * @name ICVOptions#getGroupField
        *
        * @description
        * An API method which returns the current group field from the filterbar.
        *
        * @returns {string} group field
        */
        function getGroupField() {
            var groupField = null;
            if (ctrl.filterOptions.hasOwnProperty('getGroupField')) {
                groupField = ctrl.filterOptions.getGroupField();
            }
            return groupField;
        }

        /**
       * @ngdoc method
       * @access internal
       * @module siemens.simaticit.common.widgets.itemCollectionViewer
       * @name ICVOptions#getGroupFieldSource
       *
       * @description
       * An API method which returns the current group field source from the filterbar.
       *
       * @returns {string} group field source
       */
        function getGroupFieldSource() {
            var groupFieldSource = null;
            if (ctrl.filterOptions.hasOwnProperty('getGroupFieldSource')) {
                groupFieldSource = ctrl.filterOptions.getGroupFieldSource();
            }
            return groupFieldSource;
        }

        /**
        * @ngdoc method
        * @module siemens.simaticit.common.widgets.itemCollectionViewer
        * @name ICVOptions#getSortInfo
        *
        * @description
        * An API method which returns current sort info from the filterbar.
        *
        * @returns {Object} Sort info object
        */
        function getSortInfo() {
            var sortInfo = {};
            if (ctrl.filterOptions.hasOwnProperty('getSortInfo')) {
                sortInfo = ctrl.filterOptions.getSortInfo();
            }
            return sortInfo;
        }

        /**
       * @ngdoc method
       * @module siemens.simaticit.common.widgets.itemCollectionViewer
       * @name ICVOptions#getPageInfo
       *
       * @description
       * An API method which returns current pager info.
       *
       * @returns {Object} Pager info object
       */
        function getPageInfo() {
            var pageInfo = {};
            if (ctrl.pageManager) {
                pageInfo = {
                    currentPage: ctrl.pageManager.getCurrentPage(),
                    pageCount: ctrl.pageManager.getPageCount(),
                    pageSize: ctrl.pageManager.getPageSize()
                };
            }
            return pageInfo;
        }

        /**
        * @ngdoc method
        * @module siemens.simaticit.common.widgets.itemCollectionViewer
        * @name ICVOptions#getFilterClauses
        *
        * @description
        * An API method which returns current filter clauses from the filter.
        *
        * @returns {Array} returns an array of filter clause objects.
        */
        function getFilterClauses() {
            var clauses = [];
            if (ctrl.sitFilterOptions.hasOwnProperty('getFilterClauses')) {
                clauses = ctrl.sitFilterOptions.getFilterClauses();
            }
            return clauses;
        }

        /**
        * @ngdoc method
        * @module siemens.simaticit.common.widgets.itemCollectionViewer
        * @name ICVOptions#getCurrentData
        *
        * @description
        * An API method which returns currently displayed data.
        *
        * @returns {Array} currently displayed data
        */
        function getCurrentData() {
            var result = [];
            if (ctrl.viewMode === 'grid') {
                if (ctrl.gridOptions.hasOwnProperty('getCurrentData')) {
                    result = ctrl.gridOptions.getCurrentData();
                }
            } else {
                if (ctrl.tileViewOptions.hasOwnProperty('getCurrentData')) {
                    result = ctrl.tileViewOptions.getCurrentData();
                }
            }
            return result;
        }


        /**
        * @ngdoc method
        * @module siemens.simaticit.common.widgets.itemCollectionViewer
        * @name ICVOptions#setSelectionMode
        *
        * @param {String} mode Specifies if the user can select only one item, multiple items or no items.
        * The following values are allowed:
        ** **multi**: Multiple items can be selected.
        ** **single**: Only single items can be selected.
        ** **none**: No items can be selected.
        *
        * @description
        * An API method which sets the selection mode.
        *
        */
        function setSelectionMode(mode) {
            if (mode === "single" || mode === "multi" || mode === "none") {
                ctrl.sitOptions.selectionMode = mode;
                ctrl.tileViewOptions.multiSelect = mode === "multi";
                ctrl.tileViewOptions.selectionMode = mode;
                ctrl.gridOptions.selectionMode = mode;
                // change gridOptions object to trigger grid's watch on the options
                ctrl.gridOptions = $.extend(true, {}, ctrl.gridOptions);

                if (ctrl.viewBarOptions && ctrl.viewBarOptions.check) {
                    ctrl.viewBarOptions.check.selected = ctrl.sitOptions ? ctrl.sitOptions.selectionMode === 'multi' : false;
                    ctrl.viewBarOptions.check.show = ctrl.sitOptions ? ctrl.sitOptions.selectionMode !== 'none' && viewOptions && viewOptions.indexOf('x') !== -1 : false;
                }

            }
        }

        function setOptionsAPIMethods() {
            ctrl.sitOptions.refresh = refresh;
            ctrl.sitOptions.selectItems = selectItems;
            ctrl.sitOptions.selectAll = selectAll;
            ctrl.sitOptions.updateFilterBar = updateFilterBarOptions;
            ctrl.sitOptions.expandGroup = expandGroup;
            ctrl.sitOptions.getSearchText = getSearchText;
            ctrl.sitOptions.getGroupField = getGroupField;
            ctrl.sitOptions.getGroupFieldSource = getGroupFieldSource;
            ctrl.sitOptions.getSortInfo = getSortInfo;
            ctrl.sitOptions.getFilterClauses = getFilterClauses;
            ctrl.sitOptions.getCurrentData = getCurrentData;
            ctrl.sitOptions.getPageInfo = getPageInfo;
            ctrl.sitOptions.resetPager = ctrl.pageManager.resetPager;

            //printToExcel API exposed for configured printOptions - Backward compatibility for DAF
            if (ctrl.sitOptions.printOptions.enabled) {
                ctrl.sitOptions.printToExcel = download;
            }

            // for testing so dev page can call to apply a hardcoded filter
            ctrl.sitOptions.applyFilter = applyFilterCallback;
            //}
            ctrl.sitOptions.setSelectionMode = setSelectionMode;
        }

        function onFilterApply(events, clauses, widget) {
            ctrl.filterOptions.updateFilterBadge(widget);
        }

        function onFilterReset() {
            ctrl.filterOptions.resetFilterBadge();
        }

        function onLayoutChange(event, data) {
            ctrl.setHeight();

            //update height of tile and grid container
            ctrl.tileViewOptions.viewHeight = ctrl.collectionHeight;
            ctrl.gridOptions.height = ctrl.collectionHeight;
            if (data.eventSource === "tabset" && ctrl.tileViewOptions.setTileViewHeight) {
                ctrl.tileViewOptions.setTileViewHeight();
            }
            $timeout(function () {
                ctrl.checkResponsiveness(element.parent().width());
            });
        }

        //download event callback
        function onDownloadRequest(event, args) {
            if (!ctrl.sitOptions || !ctrl.sitOptions.printOptions || ctrl.sitOptions.printOptions.id !== args.id) {
                return;
            }
            download(args.options);
        }

        function onDestroy() {
            eventListners.forEach(function (listner) {
                listner();
            });
        }

        eventListners[eventListners.length] = $scope.$on('sit-filter.apply', onFilterApply);
        eventListners[eventListners.length] = $scope.$on('sit-filter.reset', onFilterReset);
        eventListners[eventListners.length] = $scope.$on('sit-layout-change', onLayoutChange);
        eventListners[eventListners.length] = $rootScope.$on('sit-item-collection-viewer.print-to-excel', onDownloadRequest); //Backward compatibility for DAF
        eventListners[eventListners.length] = $scope.$on('$destroy', onDestroy);
        eventListners[eventListners.length] = $scope.$on('sit-item-selection-changed', function (event, selectedItems, itemChanged) {
            var selCount = selectedItems ? selectedItems.length : 0;

            if (ctrl.isTagsMgtUserAuthorized && ctrl.gridOptions.tagsManager && tagsManagementService.isDataSegregationEnabled() && ctrl.IsEntitySegregable) {
                if (ctrl.viewMode === 'grid') {
                    ctrl.gridOptions.selectedItems = selectedItems;
                } else {
                    ctrl.tileViewOptions.selectedItem = selectedItems;
                }
                if (selCount === 1) {
                    ctrl.filterOptions.tagsManagerButton = true;
                    ctrl.filterOptions.selectedItemId = selectedItems[0].Id;
                } else {
                    ctrl.filterOptions.tagsManagerButton = false;
                }
                $scope.$broadcast('sit-item-collection-viewer.rows-selection-changed', ctrl.filterOptions);
                if (selectedItems.length === 1 && selectedItems[0].Id && $state.current.name.lastIndexOf('.' + $scope.$id + 'TagsMgt') >= 0) {
                    var appInfo = getAppInfo();
                    if (appInfo.Entity && appInfo.Name) {
                        $state.go($state.current.name, { objId: selectedItems[0].Id, entity: appInfo.Entity, app: appInfo.Name }, { reload: false });
                    }
                }
                if (selectedItems.length === 0 && $state.current.name.lastIndexOf('.' + $scope.$id + 'TagsMgt') >= 0) {
                    $state.go('^');
                }
            }
            if (ctrl.gridOptions.exportManager) {
                if (ctrl.viewMode === 'grid') {
                    ctrl.gridOptions.selectedItems = selectedItems;
                } else {
                    ctrl.tileViewOptions.selectedItem = selectedItems;
                }
                if (selCount > 0) {
                    ctrl.filterOptions.exportManagerButton = true;
                } else {
                    ctrl.filterOptions.exportManagerButton = false;
                }
                $scope.$broadcast('sit-item-collection-viewer.rows-selection-changed', ctrl.filterOptions);
            }

            //sync the selectedItems in tile and grid if they are updated above
            if (ctrl.viewMode === 'grid') {
                ctrl.tileViewOptions.selectedItem = ctrl.gridOptions.selectedItems;
            } else {
                ctrl.gridOptions.selectedItems = ctrl.tileViewOptions.selectedItem;
            }
        });

        eventListners[eventListners.length] = $scope.$on('sit-filter-panel-closed', function () {
            ctrl.showFilter = !ctrl.showFilter;
        });

        eventListners[eventListners.length] = $scope.$on('compact-quick-search-enabled', function () {
            ctrl.isCompactQuickSearchEnabled = !ctrl.isCompactQuickSearchEnabled;
            setHeight();
            ctrl.tileViewOptions.viewHeight = ctrl.collectionHeight;
            ctrl.tileViewOptions.setTileViewHeight();
        });

    }

    ItemCollectionViewer.$inject = ['$log', '$timeout', '$window'];
    function ItemCollectionViewer($log, $timeout, $window) {
        return {
            restrict: 'E',
            scope: {},
            bindToController: {
                sitData: '=sitData',
                sitOptions: '=sitOptions',
                sitFormat: '=?sitFormat'
            },
            controller: ItemCollectionViewerController,
            controllerAs: 'ICVController',
            link: postLink,
            templateUrl: 'common/widgets/itemCollectionViewer/item-collection-viewer.html'
        };

        function postLink(scope, element, attr, ctrl) {
            ctrl.resetDataFlag = false;
            scope.$watch(function () {
                return ctrl.sitData;
            }, function () {
                ctrl.resetDataFlag = true;
                if (!ctrl.pageManager.isServerData()) {
                    ctrl.filterOptions.noData = (ctrl.sitData && ctrl.sitData.length) ? false : true;
                }
                ctrl.resetData();
            });
            scope.$watch(function () {
                return ctrl.gridOptions.columnDefs;
            }, function (newval, oldval) {
                if (newval !== oldval) {
                    ctrl.sitConfig.columnDefs = $.extend(true, [], ctrl.gridOptions.columnDefs);
                    var totalVisibleCols = ctrl.sitConfig.columnDefs.filter(function (obj) {
                        if (obj.visible || obj.visible === undefined) {
                            return obj;
                        }
                    });
                    if (totalVisibleCols.length === 1) {
                        var index = _.findIndex(ctrl.sitConfig.columnDefs, { visible: true });
                        ctrl.sitConfig.columnDefs[index] && (ctrl.sitConfig.columnDefs[index].columnDisabled = true);
                    }
                }
            }, true);

            scope.$watch(function () {
                return ctrl.gridOptions.noData;
            }, function (newval, oldval) {
                if (newval !== oldval) {
                    if (ctrl.pageManager.isServerData() && ctrl.viewMode === "grid") {
                        ctrl.filterOptions.noData = newval;
                    }
                }
            }, true);

            scope.$watch(function () {
                return ctrl.tileViewOptions;
            }, function (newval, oldval) {
                if (newval !== oldval) {
                    ctrl.sitTileConfig.userPreferences.titleField = window.$UIF.Object.safeGet(ctrl.tileViewOptions.titleField, 'field')
                        || ctrl.tileViewOptions.titleField
                        || '';
                    ctrl.sitTileConfig.userPreferences.titleFieldDisplayName = ctrl.tileViewOptions.titleFieldDisplayName
                        || window.$UIF.Object.safeGet(ctrl.tileViewOptions.titleField, 'displayName')
                        || ctrl.tileViewOptions.titleField
                        || '';
                    ctrl.sitTileConfig.userPreferences.titleFieldSource = ctrl.tileViewOptions.titleFieldSource
                        || null;
                    ctrl.sitTileConfig.userPreferences.titleFieldFilter = ctrl.tileViewOptions.titleFieldFilter
                        || null;
                    ctrl.sitTileConfig.userPreferences.descriptionField = window.$UIF.Object.safeGet(ctrl.tileViewOptions.descriptionField, 'field')
                        || ctrl.tileViewOptions.descriptionField
                        || '';
                    ctrl.sitTileConfig.userPreferences.descriptionFieldDisplayName = ctrl.tileViewOptions.descriptionFieldDisplayName
                        || window.$UIF.Object.safeGet(ctrl.tileViewOptions.descriptionField, 'displayName')
                        || ctrl.tileViewOptions.descriptionField
                        || '';
                    ctrl.sitTileConfig.userPreferences.descriptionFieldSource = ctrl.tileViewOptions.descriptionFieldSource
                        || null;
                    ctrl.sitTileConfig.userPreferences.descriptionFieldFilter = ctrl.tileViewOptions.descriptionFieldFilter
                        || null;
                    ctrl.sitTileConfig.userPreferences.propertyFields = $.extend(true, [], ctrl.tileViewOptions.propertyFields);
                    if (ctrl.pageManager.isServerData() && ctrl.viewMode !== "grid") {
                        ctrl.filterOptions.noData = newval.noData;
                    }
                }
            }, true);

            if (ctrl.sitOptions.quickSearchOptions) {
                scope.$watch(function () {
                    return ctrl.sitOptions.quickSearchOptions;
                }, function (newOptions, oldOptions) {
                    if (newOptions.filterText !== oldOptions.filterText) {
                        ctrl.filterOptions.quickSearchText = newOptions.filterText;
                    }
                }, true);
            }
            scope.$on('$destroy', onDirectiveDestroy);

            scope.$evalAsync(initializeHeight);

            determineICVDisplayMode();

            function initializeHeight() {
                ctrl.initializeHeight();
                if (ctrl.handleResize) {
                    angular.element($window).bind('resize', onWindowResize);
                }
            }

            function onDirectiveDestroy() {
                if (ctrl.handleResize) {
                    angular.element($window).unbind('resize', onWindowResize);
                }
            }

            function onWindowResize() {
                ctrl.setHeight();
                determineICVDisplayMode();
            }

            function determineICVDisplayMode() {
                $timeout(function () {
                    ctrl.checkResponsiveness(element.parent().width());
                });
            }
        }
    }

    angular.module('siemens.simaticit.common.widgets.itemCollectionViewer').directive('sitItemCollectionViewer', ItemCollectionViewer);

    //#region ng-doc comments
    /**
    * @ngdoc object
    * @module siemens.simaticit.common.widgets.itemCollectionViewer
    * @name icvConfigurationDetails
    * @access internal
    * @description
    * Provides a detailed description for all the options supported
    * by the **sitOptions** parameter of the {@link siemens.simaticit.common.widgets.itemCollectionViewer.sitItemCollectionViewer} directive.
    *
    * The ICV also provides an API for developers by adding methods to the **sitOptions** object.
    *
    * @property {Boolean} [alwaysShowPager=false]
    * <a id="alwaysShowPager"></a>
    *
    * Specifies if the pager is always shown.
    *
    * Default behavior hides the pager if the number of data items to show is less than the page size.
    * This option allows a user to override that behavior.
    *
    *
    * @property {String} [bgColor=undefined]
    * <a id="bgColor"></a>
    *
    * Specifies a custom color to be used as background color for **non-selected** item tiles.
    *
    * The value is applied directly to the CSS property. Example, 'red' or '#647887'.
    *
    * @property {String} [bgColorSelected=undefined]
    * <a id="bgColorSelected"></a>
    *
    * Specifies a custom color to be used as background color for **selected** item tiles.
    *
    * The value is applied directly to the CSS property. Example, 'red' or '#647887'.
    *
    * @property {String} [color=undefined]
    * <a id="color"></a>
    *
    * Specifies a custom color to be used as foreground color (text/image) for **non-selected** item tiles.
    *
    * The value is applied directly to the CSS property. Example, 'red' or '#647887'.
    *
    * @property {String} [colorSelected=undefined]
    * <a id="colorSelected"></a>
    *
    * Specifies a custom color to be used as foreground color (text/image) for **selected** item tiles.
    *
    * The value is applied directly to the CSS property. Example, 'red' or '#647887'.
    *
    * @property {String} [containerID=undefined]
    * <a id="containerID"></a>
    *
    * Identifies the **id** of a containing element to help automatically set the tile size.
    *
    * @property {String} [descriptionField=undefined]
    * <a id="descriptionField"></a>
    *
    * Specifies the name of the field to be used for the description text of tiles.
    *
    * If specified, the value of this field is retrieved and displayed in the tile.
    * It overrides any values set in the **description** property of the tile configuration object.
    * For more information, see {@link siemens.simaticit.common.widgets.tiles.tileContentDetails}.
    *
    * This property supports **dot** notation.
    * For example, consider a tile configuration object that has a property named **data**.
    * The value of the **data** property is itself an object that contains the property **type**.
    * To use the value of the **type** property as the description text of the tile,
    * set '**data.type**' in the **descriptionField** property.
    *
    * @property {Boolean} [enablePaging=true]
    * <a id="enablePaging"></a>
    *
    * Determines if the pager is shown in the UI.
    *
    * @property {String} [filterBarOptions='sqg']
    * <a id="filterBarOptions"></a>
    *
    * Defines the options available in the filter bar.
    *
    * Allowed values are:
    *  * **S**: Sorting
    *  * **Q**: Quick Search
    *  * **F**: Filtering
    *  * **G**: Grouping
    *
    ***NOTE:** Values are not case sensitive.
    *
    * @property {Object[]} [filterFields=undefined]
    * <a id="filterFields"></a>
    *
    * Defines the data fields that may be used for filtering.
    *
    * Filtering of data in the **ICV** is accomplished using the
    * {@link siemens.simaticit.common.widgets.filter.sitFilter} directive and the
    * {@link siemens.simaticit.common.widgets.filter.sitFilterService} service.
    *
    * The ICV wraps the use of these components so that a user of the ICV does
    * not need to interact with them directly. It is sufficient to define
    * filter fields with this property and add the 'F' option to the **fitlerBarOptions** property.
    *
    * See {@link siemens.simaticit.common.widgets.filter.filterFieldDetails} for a detailed
    * description of the configuration options.
    *
    *
    *
    * @property {Object} [gridConfig=undefined]
    * <a id="gridConfig"></a>
    *
    * Contains settings for displaying data items as a grid.
    *
    * Supports the following grid configuration options:
    * * **colunDefs**
    * * **customRowClasses**
    * * **enableColumnResize**
    *
    * For a full description of the options, see {@link siemens.simaticit.common.widgets.grid.gridConfigurationDetails}.
    *
    * @property {String} [groupField='']
    * <a id="groupField"></a>
    *
    * The name of a field to group by when the item collection is shown for the first time.
    *
    * @property {String[] | Object[]} [groupFields=empty array]
    * <a id="groupFields"></a>
    *
    * The list of fields a user can group by.
    *
    * If the array elements are strings, they represent the field names a user is allowed to group by.
    * These field names are added to a drop-down list in the filter bar of the ICV.
    *
    * To provide more user friendly names in the drop-down, use objects as the array elements.
    * The objects must have the following format
    * ```
    *    {
    *        field: 'lastName',
    *        displayName: 'Last Name'
    *    }
    * ```
    *
    * * **field**: defines the field name to use for grouping.
    * * **displayName**: defines the text to display in the drop-down.
    *
    * @property {String} [height=undefined]
    * <a id="height"></a>
    *
    * Specifies a fixed size (in pixels) to be used to set the height of the widget.
    *
    * When set, it overrides the height set in the **containerID**.
    *
    * @property {String} [image=undefined]
    * <a id="image"></a>
    *
    * The name of a **Font Awesome** icon to use as the default image for tiles.
    *
    * This value is only used if the image property has not been set for the tile.
    * **Note:** It does not override values that are set directly in the tile content.
    *
    * @property {Boolean} [multiSelect=true]
    * <a id="multiSelect"></a>
    *
    * Specifies if multiple items can be selected.
    *
    * @property {String} [noDataMessage=Localized version of 'No Data']
    * <a id="noDataMessage"></a>
    *
    * Specifies the message to be displayed when no data is set.
    *
    * @property {Object} [pagingOptions=<em>See</em> {@link siemens.simaticit.common.widgets.itemCollectionViewer.icvConfigurationDefaults icvConfigDefaults}]
    * <a id="pagingOptions"></a>
    *
    * Defines the options to configure the pager.
    *
    * @property {Object[]|String[]} [propertyFields=undefined]
    * <a id="propertyFields"></a>
    *
    * Defines the fields to be displayed as properties in a tile.
    *
    * Example:
    * ```
    *  propertyFields[ 'firstName', 'lastName', 'country']
    * ```
    *
    * You can also list the fields as objects to provide a localized name for the text label.
    * By default, the field name is used. For example:
    * ```
    *  propertyFields: [
    *      { field: 'firstName', displayName: 'First Name' },
    *      { field: 'lastName', displayName: 'Last Name' },
    *      { field: 'country', displayName: 'Country' },
    *  ]
    * ```
    *
    * If object notation is used and the **displayName** is not specified, the field is used as the label.
    *
    * This property supports **dot** notation.
    * For example, consider a tile configuration object that has a property named **data**.
    * The value of the **data** property is itself an object that contains the property **type**.
    * To use the value of the **type** property as one of the property fields of the tile,
    * set '**data.type**' as a **propertyField** value.
    * ```
    *     ctrl.tileConent = {
    *      ...
    *      data: {
    *          name: weight,
    *          type: grams
    *      },
    *      ...
    *      propertyFields: [
    *          { field: 'data.type', displayName: 'unit' }
    *      ]
    * }
    * ```
    *
    * @property {Object} [quickSearchOptions=undefined]
    * <a id="quickSearchOptions"></a>
    *
    * Defines the options to manage the **Quick Search** behavior.
    *
    * **Quick Search** is implemented by filtering the data collection and showing only the items
    * that match the specfied criteria. Filtering is performed on only one configured data field. The
    * field is compared with the criteria to see if it begins with the specified value.
    *
    * The object contains the following properties.
    * * **enabled**: Determines if quick search filtering is performed.
    * * **field**: The name of the field on which the search is performed.
    * * **filterText**: The search text to filter against the configured field when the ICV loads.
    * * **displayName**: The field string to display as the placeholder.
    * * **placeholderText**: The custom text to be displayed as the placeholder.
    *
    * @property {Function} [onPageChangedCallback=undefined]
    * Specifies the function to call when the current page of data is changed.
    * The function is passed one argument.
    * * **pageNumber** The number of the new page.
    *
    * @property {Function} [onSelectionChangeCallback=undefined]
    * <a id="onSelectionChangeCallback"></a>
    *
    * Specifies the function to call when the list of selected items changes.
    * The function is passed in two arguments
    * * **selectedItems** An array of objects that represents the currently selected data items.
    * * **selectedItem** The item a user clicked that triggered the selection change.
    * **Note:** Set to **null** for programmatic selection.
    *
    * @property {Function} [onSortingChangedCallback=undefined]
    * Specifies the function to call when the sort field or direction has changed.
    * The function is passed in one argument that is an object with two properties.
    * * **field** The field being sorted.
    * * **direction** The direction of the sort (asc/desc).
    *
    * @property {string} [selectionMode="multi"]
    * <a id="selectionMode"></a>
    *
    * Controls the user ability to select items in the collection.
    * The following values are allowed:
    * * **multi**: Multiple items can be selected.
    * * **single**: Only single item can be selected.
    * * **none**: No items can be selected.
    *
    * @property {Object} [serverDataOptions=undefined]
    * <a id="serverDataOptions"></a>
    *
    * Contains settings that define the presentation service and data entity
    * to be used as a data source.
    *
    * The object has the following format
    *
    * ```
    *     {
    *         dataService: engineeringData,
    *         dataEntity: 'CommandDefinition',
    *         optionsString: '',
    *         appName: 'myApp'
    *     }
    * ```
    *
    * * **dataService**: A presentation service object, such as **engineeringData**.
    * * **dataEntity**: The name of the entity to be retrieved using the service.
    * * **optionsString**: **oData** query options.
    * * **appName**: The name of the App where the entity is defined.
    *
    * @property {Object} [sortInfo=undefined]
    * <a id="sortInfo"></a>
    *
    * Defines the fields that may be used for sorting as well as the initial sort for the collection.
    *
    * The object has the following format:
    *
    * ```
    *  {
    *      field: 'lastName',
    *      direction: 'asc',
    *      fields: [
    *          { field: 'lastName', displayName: 'Last Name'},
    *          { field: 'city', displayName: 'City'},
    *          { field: 'country', displayName: 'Country'}
    *      ]
    *  }
    * ```
    *
    * * **field**: The name of the field on which to sort.
    * * **direction**: The sort direction. Allowed values are:
    *  * **asc** (Ascending)
    *  * **desc** (Descending)
    * * **fields**: An array of objects that defines the fields that may be used for sorting.
    *
    * The **fields** array contains objects with **field** and **displayName** properties.
    * This makes it possible to localize the options displayed to a user.
    * **displayName** does not need to be set. If not set, the value of **field** is used.
    *
    * The **fields** array also supports a list of strings. In this case, the strings
    * represent field names.
    * **Note:** Localization is not supported using this format.
    *
    * Specifies the name of the field to use for the title text when the tiles are shown.
    *
    * @property {Boolean} [useCustomColors="false"]
    * <a id="useCustomColors"></a>
    *
    * Specifies whether the system uses the specified custom colors when the tiles are shown.
    *
    * @property {String} [viewMode="g"]
    * <a id="viewMode"></a>
    *
    * Defines how the data is initially shown.
    *
    * The property value must be one of the following letter codes:
    * * **C**: Puts the ICV in a **Compact Mode**. For feature description, see {@link siemens.simaticit.common.widgets.itemCollectionViewer.sitItemCollectionViewer}
    * * **G**: Shows data in a grid.
    * * **S**: Shows data as small tiles. (size **medium** item tile)
    * * **M**: Shows data as medium tiles. (size **wide** item tile)
    * * **L**: Shows data as large tiles. (size **large** item tile)
    * **Note:** The letter codes are not case sensitive.
    *
    * @property {String} [viewOptions="gsmlx"]
    * <a id="viewOptions"></a>
    *
    * Defines the UI elements to be shown in the viewbar
    *
    * The property value is any combination of the following letter codes:
    * * **G**: Shows the grid button.
    * * **S**: Shows the small tile button.
    * * **M**: Shows the medium tile button.
    * * **L**: Shows the large tile button.
    * * **X**: Shows the selection mode check box.
    * **Note:** The letter codes are not case sensitive.
    *
    */
    //#endregion ng-doc comments
    //#region icvConfigurationDetails
    var icvConfigurationDetails = {
        alwaysShowPager: false,
        bgColor: '',
        bgColorSelected: '',
        color: '',
        colorSelected: '',
        containerID: '',
        descriptionField: 'myCustomDescriptionField',
        tagsManager: true,
        tagsManagerOptions: {
            entityName: '',
            appName: ''
        },
        exportManager: true,
        exportManagerOptions: {
            entityName: '',
            appName: ''
        },
        enablePaging: true,
        filterBarOptions: 'sqg',
        gridConfig: {
            columnDefs: [],
            customRowClasses: {
                //even: undefined,
                //odd: undefined,
                //selected: undefined
            },
            enableColumnResize: true
        },
        groupField: '',
        groupFields: ['title', 'author', 'yearPublished'],
        height: 400,
        image: 'fa-beer',
        noDataMessage: 'No Data',
        pageManager: null,
        pagingOptions: {
            pageSize: 10
        },
        propertyFields: undefined,
        quickSearchOptions: {
            enabled: false,
            field: '',
            filterText: '',
            displayName: '',
            placeholderText: ''
        },
        quickSearchType: 'contains',
        //onSelectionChangeCallback: mySelectionChangedHandler,
        selectionMode: 'multi',
        selectStyle: 'standard',
        serverDataOptions: {
            dataService: 'engineeringData',
            dataEntity: 'CommandDefinition',
            optionsString: ''
        },
        sortInfo: {
            field: '',
            direction: '',
            fields: []
        },
        titleField: undefined,
        useCustomColors: false,
        viewMode: 's',
        viewOptions: 'gsmlx',

        debug: false,
        enableResponsiveBehaviour: false,

        /**
        * @ngdoc method
        * @module siemens.simaticit.common.widgets.itemCollectionViewer
        * @name ICVOptions#selectItems
        *
        * @description
        * Selects or deselects items in the collection.
        *
        * Use this method only after the digest cycle, triggered by adding or updating the data collection, has completed.
        * To select data items immediately after adding them, set the item's **selected** property to **true**.
        *
        * @param {Array<Object>| Array<Number>} [items]
        * An array of objects or indexes defining the items to select.
        * * If objects are specified, a compare by reference is performed to find the matching data object in the collection.
        * * If numbers (indexes) are specified, items are selected by their current position (zero based).
        *
        * @param {Boolean} [state]
        * Set **true** to select, **false** to deselect.
        *
        * @param {Boolean} [clear]
        * If **true**, any existing selections are cleared before selecting the specified items.
        *
        */
        selectItems: function (items, state) { },

        /**
        * @ngdoc method
        * @module siemens.simaticit.common.widgets.itemCollectionViewer
        * @name ICVOptions#selectAll
        *
        * @description
        * Selects or deselects all items in the collection.
        *
        * Use this method only after the digest cycle, triggered by adding or updating the data collection, has completed.
        * To select data items immediately after adding them, set the item's **selected** property to **true**.
        *
        * @param {Boolean} [state]
        * Set **true** to select all items, **false** to deselect.
        *
        */
        selectAll: function (state) { }

    };
    //#endregion icvConfigurationDetails
    /**
    * Wraps use of the $log service for outputting diagnostic messages to the console
    * - Prepends message with a timestamp
    * - Formats message for consistency: timestamp [function] message.
    * - Can turn on/off debug messages with configuration param so you do not have to comment out in code.
    */
    function LogWrapper($log, debug) {
        this.log = function (funcName, msg) { if (debug) { $log.log(getMessage(funcName, msg)); } };
        this.info = function (funcName, msg) { $log.info(getMessage(funcName, msg)); };
        this.warn = function (funcName, msg) { $log.warn(getMessage(funcName, msg)); };
        this.error = function (funcName, msg) { $log.error(getMessage(funcName, msg)); };

        function getMessage(funcName, msg) {
            return getTimeString() + ' [' + funcName + '] ' + msg;
        }

        function getTimeString() {
            var d = new Date();
            var seconds = d.getSeconds();
            var secondString = seconds < 10 ? '0' + seconds : seconds.toString();
            var minutes = d.getMinutes();
            var minuteString = minutes < 10 ? '0' + minutes : minutes.toString();
            var hours = d.getHours();
            var hourString = hours < 10 ? '0' + hours : hours.toString();
            var ms = d.getMilliseconds();
            var msString;
            if (ms < 10) {
                msString = '00' + ms;
            } else if (ms < 100) {
                msString = '0' + ms;
            } else {
                msString = ms;
            }
            return hourString + ':' + minuteString + ':' + secondString + '.' + msString;
        }
    }
})();

(function () {
    'use strict';

    /**
     * @ngdoc service
     * @module siemens.simaticit.common.widgets.itemCollectionViewer
     * @name common.widgets.itemCollectionViewer.service
     * @access internal
     * @description
     * This service provides the functionality to support the **sitItemCollectionViewer** directive.
     * A user of that directive has no need to interact with this service directly.
     */
    angular.module('siemens.simaticit.common.widgets.itemCollectionViewer').service('common.widgets.itemCollectionViewer.service', viewManager);
    function viewManager() {

        /**
         * @ngdoc object
         * @module siemens.simaticit.common.widgets.itemCollectionViewer
         * @name icvConfigurationDefaults
         * @access internal
         * @description
         * This provides the default values for the **sitOptions**
         * parameter of {@link siemens.simaticit.common.widgets.itemCollectionViewer.sitItemCollectionViewer}.
         *
         * @example
         * The following object contains default values for all supported options that have defaults other than **undefined**.
         *
         * ```
         *  {
         *      enablePaging: true,
         *      filterBarOptions: 'sqg',
         *      groupField: '',
         *      groupFields: [],
         *      pagingOptions: {
         *          pageSizes: [10, 25, 50, 100, 250],
         *          pageSize: 10,
         *          currentPage: 1
         *      },
         *      quickSearchOptions: {
         *          enabled: true,
         *          field: '',
         *          filterText: ''
         *      },
         *      noDataMessage: 'No Data',   // actual default is localized value of "No Data"
         *      selectionMode: 'multi',     //'single' for compact mode.
         *      sortInfo: {
         *          field: '',
         *          direction: 'none',
         *          fields: []
         *      },
         *      viewMode: 'g',
         *      viewOptions: 'gsmlx',
         *  }
         * ```
         *
         * For a full description of all the options, see {@link ICVOptions}.
         *
         * <h3>Effects of default options</h3>
         * **Grouping**
         * * Data is not grouped by default.
         * * To have data grouped when first shown, set values to both **groupFields** and **groupField** options.
         *
         * **Paging**
         * * Paging is enabled by default.
         * * If the number of total data items is less than the page size, the pager is not shown.
         * * The pager can always be shown by setting the **alwaysShowPager** option to **true**.
         * * Paging can be disabled by setting the **enablePaging** option to **false**.
         *
         * **Sorting**
         * * Data is not sorted by default.
         * * This is indicated by having neither the sort ascending nor sort descending buttons highlighted as active.
         *
         *
         *
         *
         */
        this.icvConfigurationDefaults = {

            alwaysShowPager: false,

            // default download options
            downloadOptions: {
                enabled: true,
                fileName: '',
                separator: ';'
            },

            // shows or hides the pager control
            enablePaging: true,

            // controls the options displayed in the filter bar
            filterBarOptions: 'sqg',   //(s)ort, (q)uick search, (f)ilter, (g)roup

            // grid view specific settings (see common.widgets.grid.service for details)
            //      get defaults does not deep copy so having a default does nothing.
            //      verify if we should create default columns and how best to manger it.
            //gridConfig: {
            //    columnDefs: [],
            //    customRowClasses: {
            //        //even: undefined,
            //        //odd: undefined,
            //        //selected: undefined
            //    },
            //    enableColumnResize: true
            //},

            // specifies the initial field to group by
            groupField: '',

            // the comma separated list of field names a user may group by
            groupFields: [],

            // specifies allowed page sizes,  initial page size,  and initial page
            pagingOptions: {
                pageSizes: [10, 25, 50, 100, 250],
                pageSize: 10,
                currentPage: 1
            },

            // default print options - same as donwloadOptions - Backward compatibility for DAF
            printOptions: {
                enabled: false               
            },

            // specifies if quick search is active,  what field to filter on, and initial filter text
            // - if filter bar options are set to NOT show the quick search controls,
            //   the enabled setting will get set false.
            quickSearchOptions: {
                enabled: true,
                field: '',
                filterText: ''
            },

            //Specifies quicksearch to filter with 'contains
            quickSearchType: 'contains',

            // message to show when there is no data.
            //noDataMessage: 'No Data',

            // initial selection mode.
            // - options: multi, single, none
            selectionMode: 'multi',

            //       when client API for acquiring server data is set, this will need updating
            //serverConnectionParams: {
            //    ???
            //},

            // gathers the sort options into one object.
            // internally, this object is used so above 3 fields are now depricated
            sortInfo: {
                field: '',
                direction: 'none',
                fields: []
            },

            // tile view specific settings.
            // These define the mappings between data fields and places to show the data in tiles
            tileConfig: {
                titleField: '',
                descriptionField: ''
                //propertyFields: [],      //array of field names to use as tile properties
            },

            // specifies the initial viewing mode for the item collection
            // options: (g)rid, (s)mall, (m)edium, (l)arge
            viewMode: 'g',

            // specifies the view mode buttons to display.
            // options: (g)rid, (s)mall tile, (m)edium tile, (l)arge tile, (x)selection mode , (d)etails
            // - the first 4 control what view modes are available
            // - the selection mode button toggles between single and multi-select
            // - the details button is not currently supported.
            //   you could show it, but the its click handler will perform no action
            viewOptions: 'gsmlx',

            // setting true will turn on debugging messages the widget outputs to the browser console
            // this should remain off for any release implementation
            debug: false, // set true to turn on debug logging

            enableResponsiveBehaviour: false
        };

    }

    viewManager.prototype = {
        /**
         * @ngdoc method
         * @name ICVOptions#setConfigurationDefaults
         * @description
         * Sets default values on the configuration object.
         *
         * @param {Object} [config=undefined]
         * The configuration object to be updated with default values.
         *
         * For a full description of all options and default values, see {@link ICVOptions}.
         *
         */
        setConfigurationDefaults: function (config) {
            // default selection mode changes based on view mode. single for compact, multi for anything else

            var updateSortInfo = true;
            if (config) {
                updateSortInfo = !config.sortInfo;
            }

            // create an object that has all the originial settings plus the defaults
            var configWithDefaults = $.extend({}, this.icvConfigurationDefaults, config);

            // push sort options into sortInfo object if not already set.
            // NOTE: this is only to support legacy processing. 'sortInfo' on config object was introduced March 1 2015.
            //       keep this processing for a while. Check back in a few months and if not used anywhere, remove.
            if (updateSortInfo) {
                configWithDefaults.sortInfo.field = configWithDefaults.sortField ? configWithDefaults.sortField : '';
                configWithDefaults.sortInfo.direction = configWithDefaults.sortDirection ? configWithDefaults.sortDirection : '';
                configWithDefaults.sortInfo.fields = configWithDefaults.sortFields ? configWithDefaults.sortFields : [];
            }

            //update download option
            configWithDefaults.downloadOptions.enabled = configWithDefaults.downloadOptions.hasOwnProperty('enabled') ?
                configWithDefaults.downloadOptions.enabled : true;
            configWithDefaults.downloadOptions.separator = configWithDefaults.downloadOptions.separator || ';';

            // overriding donwloadOptions with printOptions - Backward compatibility for DAF
            if (configWithDefaults.printOptions.enabled && configWithDefaults.printOptions.id) {
                configWithDefaults.downloadOptions = configWithDefaults.printOptions;
            } else {
                configWithDefaults.printOptions.enabled = false;
            }

            // update the original obect with default values
            $.extend(config, configWithDefaults);

            if (config) {
                var filterBarOptions = config.filterBarOptions.toLowerCase();
                if (filterBarOptions.indexOf("q") === -1) {
                    config.quickSearchOptions.enabled = false;
                }
            }

            return config;
        }

    };

    /**************************************************************************
     * private helper methods and static data
     */
    angular.module('siemens.simaticit.common.widgets.itemCollectionViewer')
        .service('common.widgets.itemCollectionViewer.preloadService', preloadService);
    // inject angular log servive
    preloadService.$inject = ['common.services.logger.service', '$injector', '$timeout', '$rootScope'];
    function preloadService(logger, $injector, $timeout, $rootScope) {

        var pluginsServices = [];

        function getDefaultServices() {
            return _.filter(pluginsServices, function (item) {
                return item.isDefault();
            });
        }

        function getService(serviceName) {
            var serviceInstance = _.findWhere(pluginsServices, { name: serviceName });
            if (serviceInstance) {

                logger.logError(serviceName + "is not registerd.");
                return null;
            }
            return serviceInstance;
        }

        function register(service) {
            if (service.validate()) {
                pluginsServices.push(service);
            }
        }

        function unRegister(serviceName) {
            if (serviceName.validate()) {
                this.isDefault ?
                    logger.warn(serviceName + " is a defaultService cannot be unregistered") :
                    pluginsServices.pop(serviceName);
            } else {
                logger.warning(serviceName + " is not available to unregister");
            }
        }

        function Preload(name, isDefaultService) {
            var _isDefault = isDefaultService;
            this.load = null;
            this.name = name;
            this.isDefault = function () {
                return _isDefault;
            }
        }

        Preload.prototype.validate = function () {
            var _name = window.$UIF.Object.safeGet(this, 'name');
            var result = true;
            if (!_name) {
                logger.logError("#Error: A name is required for \"Preload\"");
                result = false;
            }

            if (_.findWhere(pluginsServices, { name: _name })) {
                logger.warning("#Warning: With \"" + this.name + "\" service is already registred");
                result = false;
            }

            if (!window.$UIF.Object.isFunction(this.load)) {
                logger.logError("#Error: In service " + this.name + "load method is not implemented");
                result = false;
            }
            return result;
        };

        this.register = register;
        this.unRegister = unRegister;
        this.Preload = Preload;
        this.getDefaultServices = getDefaultServices;
        this.getService = getService;
        (function () {
            var widget = "sit-filter-panel";
            var personalizeService = $injector.get('common.services.filterPersonalization.filterPersonalizationService');
            var filterPanelService = $injector.get('common.filterPanel.filterPanelService');
            var savedFilters;
            function getSavedFilters(widget, preferenceId) {
                return personalizeService.retrieveFilterClauses(widget, preferenceId);
            }
            function reformClause(values) {
                var filterData = [];
                var value;
                values.forEach(function (field) {
                    if ((field.value !== '' && field.value !== undefined) || (field.widgetAttributes && field.widgetAttributes["sit-selected-string"] !== ''
                        && field.widgetAttributes["sit-selected-string"] !== undefined)) {
                        if (field.widget === 'sit-select') {
                            value = field.value[field.toKeep];
                        } else if (field.widget === 'sit-checkbox') {
                            value = field.value[0].checked;
                        } else if (field.widget === 'sit-multi-select' || field.widget === 'sit-advanced-select') {
                            value = field.widgetAttributes["sit-selected-string"];
                        } else if (field.widget === 'sit-entity-picker') {
                            value = field.value[field.toKeep] || field.value[field.field];
                        } else {
                            value = field.value;
                        }

                        filterData[filterData.length] = {
                            "filterField": field,
                            "value": value,
                            "widget": field.widget,
                            "andOr": "and",
                            "operator": "=",
                            "matchCase": false,
                            "showValueField": false
                        };
                        value = '';
                    }
                });
                return filterData;
            }
            var defaultFilter = new Preload("DefaultFilter", true);
            defaultFilter.load = function (icvOptions) {
                savedFilters = getSavedFilters(widget, icvOptions.sitOptions.userPrefId);
                if (savedFilters && savedFilters.length) {
                    savedFilters.forEach(function (filterData) {
                        if (filterData.default) {
                            filterPanelService.setPreviousFilterClauses({ id: icvOptions.sitOptions.userPrefId, data: filterData });
                            $timeout(function () {
                                if (icvOptions.sitOptions.filterFields.onApplyCallback) {
                                    icvOptions.sitOptions.filterFields.onApplyCallback(reformClause(filterData.filterClauses), filterData.filterName)
                                } else {
                                    icvOptions.applyFilter(reformClause(filterData.filterClauses));
                                }
                                $rootScope.$emit('sit-filter.apply', null, 'sitFilterPanel');
                            }, 0);
                        }
                    });
                }
            }

            register(defaultFilter);
        })();
    }
})();
