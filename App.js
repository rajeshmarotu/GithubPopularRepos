import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, ActivityIndicator,ImageBackground, Image, FlatList, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { List, ListItem } from 'react-native-elements';


const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;



const Header = () => {
  return (
    <View style={[styles.shadowStyle,{flexDirection:'row',paddingHorizontal:'5%',paddingTop:'5%'}]}>
      <View style={{flex:0.2}}>
        <Image
          style={{width:'70%', height:'60%'}}
          source={{uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png'}}
        />
      </View>
      <View style={{flexDirection:'row',flex:0.8}}>
        <View>
          <Text style={{fontSize:35}}>GitHub</Text>
        </View>
        <View>
          <Text style={{fontSize:18,paddingVertical:'6%',paddingHorizontal:'5%'}}>Popular</Text>
        </View>
        <View>
          <Text style={{fontSize:18,paddingVertical:'6%'}}>Repositories</Text>
        </View>

      </View>
    </View>
  )
}

const fetchOptions = {
   headers: {
            'Authorization': 'token cdf9358a6530428820c823347a670c3f4a3dfa5',
        }
}
export default class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      data:[],
      loading:'initial',
      error:'',
      length: 0,
      languageRepos:{},
      loadSplashScreen:false,
      isClicked:{

      },
      dataSource:[

      ]
    }
  }

  componentDidMount(){
      setTimeout( () => {
          this.stopRenderSplash();
          this.loadData()
      },2000);
  }

  stopRenderSplash(){
    this.setState({loadSplashScreen:true,loading:true})
  }

  loadData(){
      fetch('https://api.github.com/search/repositories?q=stars%3A>1000&sort=stars&order=desc&per_page=10',{headers:{'Authorization':'token 8cdf9358a6530428820c823347a670c3f4a3dfa5'}}).then(res=>res.json()).then(results=>{

        var urls=[]
        results['items'].forEach( result => {
            urls.push(fetch(result.languages_url,{headers:{'Authorization':'token 8cdf9358a6530428820c823347a670c3f4a3dfa5'}}).then(r => r.json()));
        })

        return urls;
      }).then(urls => {
        // console.log(urls);
        var data = {};
        var keys=[];
        return Promise.all(
          urls
        ).then(languages=>{
          languages.forEach(item=>{
            for(var language in item){
              if(language in data){
                data[language]+=item[language]
              }else{
                data[language]=item[language]
                keys.push(language)
              }
            }
          })
          return keys;
        }).then(keys=>{
          var mostUsedLanguages=[];
          mostUsedLanguages = keys.sort(function(a,b){return data[b]-data[a]});
          return mostUsedLanguages;
        });
      }).then((langs)=>{

          fetch('https://api.github.com/search/repositories?q=topic%3A'+langs[0]+'&type=Repositories&sort=stars&order=desc&per_page=10',{headers:{'Authorization':'token 8cdf9358a6530428820c823347a670c3f4a3dfa5'}})
          .then(r => r.json())
          .then(topLangData=>{
            var topLangItems = topLangData['items'];
            // console.log(topLangItems);
            var Data = this.state.dataSource;
            var isClicked=[]
            langs.slice(0,10).forEach((lang,i)=>{
              isClicked[lang]= (i==0)?true:false;
              Data.push({
                language:lang,
                isLoaded:false,
                items:i==0?(topLangItems):[]
              })
            })
            this.setState({
              isClicked:isClicked,
              dataSource:Data,
              loading:false
            })
          })

      })
  }

  renderSplashScreen(){
    return (
      <ImageBackground source={require('./assets/images/white_bg.jpeg')} style={{width: '100%', height: '100%'}}>
        <View style={{padding:'10%',justifyContent:'center',alignItems:'center'}}>
            <Image
              style={{width:'35%', height:'35%',marginTop:'50%',alignSelf:'center'}}
              source={{uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png'}}
            />
            <Text style={{fontSize:30,marginTop:'5%'}}>
              GitHub
            </Text>
            <Text style={{fontSize:25,marginTop:'5%'}}>
              Popular Repos
            </Text>

        </View>
      </ImageBackground>
    )
  }

  keyExtractor = (item, index) => index



  renderRepositoriesLanguageWise = ({ item }) =>{
    var returnValue = [];
    var index= 0;

    for(var language in item){
      returnValue.push(this.renderItem(item[language]["items"],language,index));
      index+=1;
    }

    return <View style={{flexDirection:'column'}}>
            {
              returnValue
            }
           </View>;
  }

  onAuthorPress = () =>{
    return <WebView/>
  }

  buildRow = (items,language,row_no) => {
    var cols = []
    for(var i = 0; i<2;i++){
      var position = row_no*2+i;
      var odd = true;
      if((position+1)%2==0){
        odd=false;
      }
      if(position<10){
        cols.push(
            <View style={{flex:0.5}} key={language+"_"+row_no+"_"+i}>
              <ListItem
                title={
                  <TouchableOpacity onPress={()=> Linking.openURL('https://google.com') }>
                    <Text style={{color:'black',fontWeight:'500'}}>{items[position].title}</Text>
                  </TouchableOpacity>
                  }
                subtitle={
                  <TouchableOpacity onPress={()=> Linking.openURL('https://google.com') }>
                    <Text style={{color:'blue'}}>{items[position].owner_name}</Text>
                  </TouchableOpacity>
                }
                leftAvatar={{
                  source: items[position].icon_url && { uri: items[position].icon_url },
                  title: items[position].title[0]
                }}
                contentContainerStyle={{width:'100%',height:'7%',paddingRight:`${odd}`==true?1:0}}
              />
            </View>
        )
      }
    }
    return (
        <View key={language+"_"+row_no} style={{flexDirection:'row',paddingVertical:'1%'}}>
            {
              cols
            }
        </View>
      );
  }

  renderItem = (items,language,index ) => {
    var l = [0,1,2,3,4]
    return (
        <View  key={language} style={{flexDirection:'column',paddingVertical:'2%'}}>
          <View style={{flex:0.2}}>
            <Text style={{fontSize:24,fontWeight:'600'}}>#{index+1}&nbsp;&nbsp;{language}</Text>
          </View>
          <View key={language+"#"+index} style={{flex:0.8,flexDirection:'column'}}>
            {
              l.map((row_no)=>{
                return (
                    this.buildRow(items,language,row_no)
                )
              })
            }
          </View>
        </View>
      )
  }


  render(){

    const { loading,dataSource,isClicked } = this.state;

    if(!this.state.loadSplashScreen){
      return (
        <View style={[styles.container,{justifyContent:'center',alignItems:'center'}]}>
            {this.renderSplashScreen()}
        </View>
      )
    }

    if( this.state.loadSplashScreen && loading == true ){
      return(
        <View style={[styles.container,{justifyContent:'center',alignItems:'center'}]}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )
    }
    if( loading == false ){
      return(
        <View style={[styles.container,{flex:1,flexDirection:'column'}]}>
          <View style={{flex:0.15}}>
            <Header />
          </View>
          <View style={{flex:0.85,flexDirection:'column'}}>
            {
            //   <FlatList
            //   keyExtractor={this.keyExtractor}
            //   data={this.state.dataSource}
            //   renderItem={this.renderRepositoriesLanguageWise}
            // />
            }
            <Text>Content goes here</Text>
          </View>
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addMargin: {
    flex:0.45,
    marginRight:0.05
  },
  noMargin: {
    flex:0.50
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  shadowStyle: {
    borderWidth: 1,
    borderColor: '#cdcdcd',
    borderTopWidth: 0,
    borderLeftWidth:0,
    borderRightWidth:0,
    shadowColor: '#ddd',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    elevation: 1,
  }
});
